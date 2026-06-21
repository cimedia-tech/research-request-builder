import { GoogleGenerativeAI } from "@google/generative-ai";

export interface JobRecord {
  jobId: string;
  timestamp: string;
  requestorName: string;
  requestorEmail: string;
  originalQuestion: string;
  detectedDivision: string;
  topic: string;
  briefPrompt: string;
  briefPreview: string;
  status: "pending_approval" | "approved" | "completed";
  gdriveFolderLink: string | null;
  oneParagraphSummary: string;
  researchType: string;
  artifacts: {
    reportLink: string;
    briefLink: string;
    dataTablesLink: string;
    notebookLink?: string;
    webReportLink?: string;
  };
}

export interface ResearchTypeRecord {
  name: string;
  description: string;
  rubric: string;
  count: number;
}

export interface ResearchDatabase {
  jobs: JobRecord[];
  researchTypes: ResearchTypeRecord[];
}

const DB_FILENAME = "research_machine_database.json";
const PARENT_FOLDER_ID = process.env.GDRIVE_PARENT_FOLDER_ID || "1dlZWci9qCHahHpyIpiNqStjWpYCq5s4M";

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
    throw new Error(`Token refresh failed: ${await res.text()}`);
  }

  return (await res.json()).access_token;
}

export async function readDatabase(): Promise<ResearchDatabase> {
  try {
    const accessToken = await getAccessToken();

    // 1. Search for research_machine_database.json
    const q = `name = '${DB_FILENAME}' and '${PARENT_FOLDER_ID}' in parents and trashed = false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!searchRes.ok) throw new Error("Failed to search database file");
    const searchData = await searchRes.json();
    const files = searchData.files || [];

    if (files.length === 0) {
      return { jobs: [], researchTypes: [] };
    }

    const fileId = files[0].id;

    // 2. Download file content
    const downloadRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!downloadRes.ok) throw new Error("Failed to download database content");
    return await downloadRes.json();
  } catch (error) {
    console.error("readDatabase error:", error);
    return { jobs: [], researchTypes: [] };
  }
}

export async function writeDatabase(db: ResearchDatabase): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();

    // 1. Search for research_machine_database.json
    const q = `name = '${DB_FILENAME}' and '${PARENT_FOLDER_ID}' in parents and trashed = false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!searchRes.ok) throw new Error("Failed to search database file");
    const searchData = await searchRes.json();
    const files = searchData.files || [];

    const jsonStr = JSON.stringify(db, null, 2);

    if (files.length > 0) {
      const fileId = files[0].id;
      // Update existing file using simple media upload
      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: jsonStr,
        }
      );
      return updateRes.ok;
    } else {
      // Create new file
      const boundary = "boundary_db_upload";
      const metadata = {
        name: DB_FILENAME,
        parents: [PARENT_FOLDER_ID],
        mimeType: "application/json",
      };

      const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
        metadata
      )}\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${jsonStr}\r\n--${boundary}--`;

      const createRes = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );
      return createRes.ok;
    }
  } catch (error) {
    console.error("writeDatabase error:", error);
    return false;
  }
}

export async function runAIImprovementLoop(
  question: string,
  currentDb: ResearchDatabase
): Promise<{ summary: string; type: string; rubric: string }> {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const isWorkingGeminiKey =
      geminiApiKey &&
      geminiApiKey.startsWith("AIzaSy") &&
      geminiApiKey !== "AIzaSyDFIWhNUioUfQ1_T_061bLOafykTFXyfvw";

    const prompt = `You are the Research Machine AI Director.
Given a client's research question, perform three tasks:
1. Write a one-paragraph summary (3-4 sentences) that describes the focus and target outcomes of this research, suitable for cataloging.
2. Classify the query into a specific, professional "Research Type" (e.g. "Feasibility Study", "Market Trend Analysis", "Competitive Benchmarking", "Literature Review"). Keep it to 2-4 words.
3. Devise a quality assurance check Rubric (3-4 bullet points) detailing the specific criteria needed to validate research for this type of topic (e.g. what data sources to verify, what biases to test, what financial parameters to check).

Research Question: "${question}"

Existing Research Types and Rubrics for reference:
${JSON.stringify(currentDb.researchTypes, null, 2)}

Respond ONLY in valid JSON format:
{
  "summary": "one-paragraph summary",
  "type": "Research Type Name",
  "rubric": "- Bullet 1\\n- Bullet 2\\n- Bullet 3"
}`;

    let responseText = "";

    if (isWorkingGeminiKey) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      });
      responseText = result.response.text();
    } else {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) {
        throw new Error("No API key configured for AI Loop");
      }
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.5,
          max_tokens: 1024,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        responseText = data.choices[0].message.content;
      }
    }

    if (responseText) {
      const parsed = JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim());
      return {
        summary: parsed.summary || "No summary generated.",
        type: parsed.type || "General Research",
        rubric: parsed.rubric || "- Verify sources\\n- Review facts",
      };
    }
  } catch (error) {
    console.error("runAIImprovementLoop error:", error);
  }

  // Fallback
  return {
    summary: `An investigation focusing on: ${question}`,
    type: "General Research",
    rubric: "- Verify primary data sources\n- Review methodology",
  };
}

export async function registerJobInDb(
  job: JobRecord,
  aiLoopResult: { summary: string; type: string; rubric: string }
): Promise<boolean> {
  try {
    const db = await readDatabase();
    db.jobs = db.jobs || [];
    db.jobs.push(job);

    db.researchTypes = db.researchTypes || [];
    const existingType = db.researchTypes.find(
      (t) => t.name.toLowerCase() === aiLoopResult.type.toLowerCase()
    );

    if (existingType) {
      existingType.count = (existingType.count || 0) + 1;
      if (aiLoopResult.rubric && !existingType.rubric.includes(aiLoopResult.rubric)) {
        existingType.rubric = existingType.rubric + "\n" + aiLoopResult.rubric;
      }
    } else {
      db.researchTypes.push({
        name: aiLoopResult.type,
        description: `Discovered from job ${job.jobId}`,
        rubric: aiLoopResult.rubric,
        count: 1,
      });
    }

    return await writeDatabase(db);
  } catch (err) {
    console.error("registerJobInDb error:", err);
    return false;
  }
}

export async function updateJobStatusInDb(
  jobId: string,
  status: "approved" | "completed"
): Promise<boolean> {
  try {
    const db = await readDatabase();
    db.jobs = db.jobs || [];
    const job = db.jobs.find((j) => j.jobId === jobId);
    if (job) {
      job.status = status;
      return await writeDatabase(db);
    }
    return false;
  } catch (err) {
    console.error("updateJobStatusInDb error:", err);
    return false;
  }
}

