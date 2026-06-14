import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * /api/submit — Submit a research request directly to the Research Machine
 * 
 * This endpoint:
 * 1. Sends the prompt via Telegram for immediate notification
 * 2. Saves the prompt to a dispatch queue file for the Research Machine
 * 3. Returns a confirmation with a job ID
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, division, question } = body;

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const jobId = `RM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    // 1. Send via Telegram
    const telegramSent = await sendTelegram(jobId, division, question, prompt);

    // 2. Save to dispatch queue (for local Research Machine pickup)
    const dispatched = await saveToDispatchQueue(jobId, division, question, prompt, timestamp);

    return NextResponse.json({
      success: true,
      jobId,
      timestamp,
      telegram: telegramSent,
      dispatched,
      message: `Research engagement ${jobId} submitted to the Research Machine.`,
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
  prompt: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram credentials not configured");
    return false;
  }

  // Truncate prompt for Telegram (4096 char limit)
  const maxPromptLen = 3000;
  const truncatedPrompt =
    prompt.length > maxPromptLen
      ? prompt.substring(0, maxPromptLen) + "\n\n... [truncated — full prompt in dispatch queue]"
      : prompt;

  const message = `🔬 NEW RESEARCH ENGAGEMENT SUBMITTED

📋 Job ID: ${jobId}
🏢 Division: ${division || "Auto-detect"}
📅 Submitted: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}

💡 Original Question:
${question}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 RESEARCH BRIEF:
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${truncatedPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Submitted via CIMedia Research Request Builder
🔗 The Research Machine is standing by.`;

  try {
    const resp = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: parseInt(chatId),
          text: message,
          parse_mode: undefined, // Plain text to avoid markdown parsing issues
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

async function saveToDispatchQueue(
  jobId: string,
  division: string,
  question: string,
  prompt: string,
  timestamp: string
): Promise<boolean> {
  try {
    // Save to a known dispatch directory
    const dispatchDir = path.join(
      process.cwd(),
      "dispatch-queue"
    );

    // Create dispatch directory if it doesn't exist
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
      submittedBy: "CIMedia Research Request Builder",
      targetAgent: "research_machine",
    };

    fs.writeFileSync(jobFile, JSON.stringify(jobData, null, 2));

    // Also save the prompt as a standalone .md file for easy reading
    const promptFile = path.join(dispatchDir, `${jobId}.md`);
    fs.writeFileSync(
      promptFile,
      `# Research Engagement: ${jobId}\n\n**Submitted:** ${timestamp}\n**Division:** ${division || "Auto-detect"}\n**Question:** ${question}\n\n---\n\n${prompt}`
    );

    return true;
  } catch (err) {
    console.error("Dispatch queue save failed:", err);
    return false;
  }
}
