import { NextRequest, NextResponse } from "next/server";

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
    throw new Error(`Failed to refresh Google access token: ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobFolderId = searchParams.get("jobFolderId");

    if (!jobFolderId) {
      return NextResponse.json({ error: "jobFolderId parameter is required" }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    // 1. List all files under this job folder
    const q = `'${jobFolderId}' in parents and trashed = false`;
    const filesRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!filesRes.ok) {
      const errText = await filesRes.text();
      throw new Error(`Failed to list files inside job folder: ${errText}`);
    }

    const filesData = await filesRes.json();
    const files = filesData.files || [];

    // Find files by name prefix/infix
    const briefFile = files.find((f: any) => f.name.includes("Brief"));
    const previewFile = files.find((f: any) => f.name.includes("Preview"));

    let prompt = "";
    let preview = "";

    // 2. Fetch brief content
    if (briefFile) {
      const bRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${briefFile.id}?alt=media`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (bRes.ok) {
        prompt = await bRes.text();
      }
    }

    // 3. Fetch preview content
    if (previewFile) {
      const pRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${previewFile.id}?alt=media`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (pRes.ok) {
        preview = await pRes.text();
      }
    }

    return NextResponse.json({ prompt, preview });
  } catch (error: any) {
    console.error("Load job details error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
