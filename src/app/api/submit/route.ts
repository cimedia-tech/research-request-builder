import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { readDatabase, registerJobInDb, runAIImprovementLoop, JobRecord } from "../../../lib/driveDb";
import { sendGmailAlert } from "../../../lib/gmail";


/**
 * /api/submit — Submit a research request directly to the Research Machine
 * 
 * This endpoint:
 * 1. Creates a client folder and job subfolder in Google Drive and uploads assets (Survey, Brief, Outline)
 * 2. Sends the prompt and Drive link via Telegram for immediate notification
 * 3. Saves the prompt and Drive link to a local dispatch queue file (for local execution)
 * 4. Returns a confirmation with a job ID and Google Drive folder link
 */

async function getAccessToken(): Promise<string> {
  const clientId = process.env.GDRIVE_CLIENT_ID;
  const clientSecret = process.env.GDRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GDRIVE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google Drive credentials are not configured in environment variables");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Token refresh failed: ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

function simpleMdToHtml(md: string): string {
  // Convert basic Markdown to HTML
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Underline or italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Lists
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');

  // Parse paragraphs and wrap list items
  const lines = html.split('\n');
  let inList = false;
  const processedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('<li>')) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(line);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (trimmed && !trimmed.startsWith('<h') && !trimmed.startsWith('<hr')) {
        processedLines.push(`<p>${line}</p>`);
      } else {
        processedLines.push(line);
      }
    }
  }
  if (inList) {
    processedLines.push('</ul>');
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: 'Georgia', serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; }
h1 { font-size: 20pt; color: #0a0e27; border-bottom: 2px solid #d4a843; padding-bottom: 5px; }
h2 { font-size: 15pt; color: #0a0e27; margin-top: 20px; }
h3 { font-size: 12pt; color: #0a0e27; }
p { margin: 10px 0; }
ul { padding-left: 20px; }
li { margin: 5px 0; }
strong { color: #0a0e27; }
</style>
</head>
<body>
${processedLines.join('\n')}
</body>
</html>`;
}

async function uploadToGoogleDrive(
  jobId: string,
  division: string,
  question: string,
  prompt: string,
  preview: string,
  name: string,
  email: string,
  answers: Record<string, string>,
  questions: any[]
): Promise<string | null> {
  try {
    const parentFolderId = process.env.GDRIVE_PARENT_FOLDER_ID || "1dlZWci9qCHahHpyIpiNqStjWpYCq5s4M";
    const accessToken = await getAccessToken();

    // 1. Find or Create Client Folder
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const searchQ = `mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents and name contains '${cleanEmail}' and trashed = false`;
    
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQ)}&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    let clientFolderId = "";
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        clientFolderId = searchData.files[0].id;
      }
    }

    if (!clientFolderId) {
      // Create Client Folder under parent
      const cfMeta = {
        name: `Client - ${cleanName} (${cleanEmail})`,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderId],
      };
      const cfRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cfMeta),
      });
      if (!cfRes.ok) throw new Error(`Failed to create client folder: ${await cfRes.text()}`);
      clientFolderId = (await cfRes.json()).id;
    }

    // 2. Create Job Subfolder inside Client Folder
    const cleanTopic = question.length > 40 ? question.substring(0, 40) + "..." : question;
    const sanitizedTopic = cleanTopic.replace(/[/\\?%*:|"<>]/g, "-");
    const jfMeta = {
      name: `${jobId} - ${sanitizedTopic}`,
      mimeType: "application/vnd.google-apps.folder",
      parents: [clientFolderId],
    };
    const jfRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jfMeta),
    });
    if (!jfRes.ok) throw new Error(`Failed to create job folder: ${await jfRes.text()}`);
    const jobFolder = await jfRes.json();
    const jobFolderId = jobFolder.id;

    // 3. Upload Styled HTML Files converted to Google Docs
    const boundary = "boundary_vantage_rm";

    // File 1: 1 — Research Brief
    const html1 = simpleMdToHtml(prompt);
    const f1Meta = { name: "1 — Research Brief", parents: [jobFolderId], mimeType: "application/vnd.google-apps.document" };
    const f1Body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(f1Meta)}\r\n--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html1}\r\n--${boundary}--`;
    await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": `multipart/related; boundary=${boundary}` },
      body: f1Body,
    });

    // File 2: 2 — Strategic Preview
    const html2 = simpleMdToHtml(preview || "No preview generated");
    const f2Meta = { name: "2 — Strategic Preview", parents: [jobFolderId], mimeType: "application/vnd.google-apps.document" };
    const f2Body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(f2Meta)}\r\n--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html2}\r\n--${boundary}--`;
    await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": `multipart/related; boundary=${boundary}` },
      body: f2Body,
    });

    // File 3: 3 — Intake Survey
    let surveyContent = `# Research Request Intake Survey: ${jobId}\n\n`;
    surveyContent += `**Submitter Name:** ${cleanName}\n`;
    surveyContent += `**Submitter Email:** ${cleanEmail}\n`;
    surveyContent += `**Original Question:** ${question}\n\n`;
    surveyContent += `---\n\n## Refinement Survey Answers\n\n`;

    if (Array.isArray(questions) && questions.length > 0) {
      questions.forEach((q: any) => {
        const answer = answers[q.id] || "N/A";
        surveyContent += `### Q: ${q.question}\n`;
        surveyContent += `**A:** ${answer}\n\n`;
      });
    } else {
      surveyContent += `No follow-up questions answered.\n`;
    }

    const html3 = simpleMdToHtml(surveyContent);
    const f3Meta = { name: "3 — Intake Survey", parents: [jobFolderId], mimeType: "application/vnd.google-apps.document" };
    const f3Body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(f3Meta)}\r\n--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html3}\r\n--${boundary}--`;
    await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": `multipart/related; boundary=${boundary}` },
      body: f3Body,
    });

    // 4. Set Permissions to anyone can view
    await fetch(`https://www.googleapis.com/drive/v3/files/${jobFolderId}/permissions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "anyone", role: "reader" }),
    });

    // 5. Get folder webViewLink
    const getFolderRes = await fetch(`https://www.googleapis.com/drive/v3/files/${jobFolderId}?fields=webViewLink`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (getFolderRes.ok) {
      const folderData = await getFolderRes.json();
      return folderData.webViewLink;
    }

    return `https://drive.google.com/drive/folders/${jobFolderId}`;
  } catch (err) {
    console.error("Google Drive folder creation failed:", err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, preview, division, question, name, email, answers, questions } = body;

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const jobId = `RM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    // 1. Run AI Improvement Loop to classify type, summary, and rubric
    const db = await readDatabase();
    const aiResult = await runAIImprovementLoop(question || "N/A", db);

    // 2. Create client subfolder in Google Drive and upload free assets
    const gdriveFolderLink = await uploadToGoogleDrive(
      jobId,
      division || "Auto-detect",
      question || "N/A",
      prompt,
      preview || "",
      name || "Anonymous",
      email || "N/A",
      answers || {},
      questions || []
    );

    // 3. Register Job in the Google Drive JSON database with status pending_approval
    const jobRecord: JobRecord = {
      jobId,
      timestamp,
      requestorName: name || "Anonymous",
      requestorEmail: email || "N/A",
      originalQuestion: question || "N/A",
      detectedDivision: division || "Auto-detect",
      topic: question || "N/A",
      briefPrompt: prompt,
      briefPreview: preview || "",
      status: "pending_approval",
      gdriveFolderLink: gdriveFolderLink,
      oneParagraphSummary: aiResult.summary,
      researchType: aiResult.type,
      artifacts: {
        reportLink: "",
        briefLink: "",
        dataTablesLink: ""
      }
    };
    await registerJobInDb(jobRecord, aiResult);

    // 4. Send Gmail Alert to cimedia316@gmail.com
    const cleanTopic = question || "N/A";
    const shortTopic = cleanTopic.length > 50 ? cleanTopic.substring(0, 50) + "..." : cleanTopic;
    const emailSubject = `[Research Brief] ${aiResult.type} - ${shortTopic}`;
    await sendGmailAlert(emailSubject, prompt);

    // 5. Send via Telegram (marked as pending approval)
    const telegramSent = await sendTelegram(jobId, division, question, prompt, name, email, gdriveFolderLink);

    return NextResponse.json({
      success: true,
      jobId,
      timestamp,
      telegram: telegramSent,
      dispatched: false,
      gdriveFolderLink,
      status: "pending_approval",
      message: `Research request ${jobId} submitted and pending manager approval.`,
    });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit research request", details: String(error) },
      { status: 500 }
    );
  }
}

async function sendTelegram(
  jobId: string,
  division: string,
  question: string,
  prompt: string,
  name?: string,
  email?: string,
  gdriveFolderLink?: string | null
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram credentials not configured");
    return false;
  }

  const maxPromptLen = 3000;
  const truncatedPrompt =
    prompt.length > maxPromptLen
      ? prompt.substring(0, maxPromptLen) + "\n\n... [truncated — full prompt in Google Drive / local queue]"
      : prompt;

  const message = `🔬 NEW RESEARCH ENGAGEMENT SUBMITTED

📋 Job ID: ${jobId}
🚦 Status: PENDING APPROVAL (HITL control active)
🏢 Division: ${division || "Auto-detect"}
👤 Submitter: ${name || "Anonymous"} (${email || "N/A"})
📅 Submitted: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}
📁 Google Drive Folder: ${gdriveFolderLink || "Failed to create"}

💡 Original Question:
${question}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 RESEARCH BRIEF:
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${truncatedPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👉 Go to the Vantage Admin Dashboard to review and approve this job.
⚡ Submitted via Vantage Research Request Builder`;

  try {
    const resp = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: parseInt(chatId),
          text: message,
          parse_mode: undefined,
        }),
      }
    );

    if (!resp.ok) {
      console.error("Telegram error:", await resp.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error("Telegram send failed:", err);
    return false;
  }
}

export async function saveToDispatchQueue(
  jobId: string,
  division: string,
  question: string,
  prompt: string,
  timestamp: string,
  name?: string,
  email?: string,
  gdriveFolderLink?: string | null
): Promise<boolean> {
  if (process.env.VERCEL) {
    console.log("Running on Vercel, skipping local filesystem queue save");
    return true;
  }
  try {
    const dispatchDir = path.join(process.cwd(), "dispatch-queue");

    if (!fs.existsSync(dispatchDir)) {
      fs.mkdirSync(dispatchDir, { recursive: true });
    }

    const jobFile = path.join(dispatchDir, `${jobId}.json`);

    const jobData = {
      jobId,
      status: "pending",
      division: division || "auto-detect",
      originalQuestion: question,
      prompt,
      submittedAt: timestamp,
      submittedBy: name ? `${name} <${email}>` : "Vantage Research Request Builder",
      targetAgent: "research_machine",
      gdriveFolderLink: gdriveFolderLink || null,
    };

    fs.writeFileSync(jobFile, JSON.stringify(jobData, null, 2));

    const promptFile = path.join(dispatchDir, `${jobId}.md`);
    fs.writeFileSync(
      promptFile,
      `# Research Engagement: ${jobId}\n\n**Submitted:** ${timestamp}\n**Submitter:** ${name || "Anonymous"} (${email || "N/A"})\n**Division:** ${division || "Auto-detect"}\n**Google Drive Folder:** [Client Folder](${gdriveFolderLink || ""})\n**Question:** ${question}\n\n---\n\n${prompt}`
    );

    return true;
  } catch (err) {
    console.error("Dispatch queue save failed:", err);
    return false;
  }
}
