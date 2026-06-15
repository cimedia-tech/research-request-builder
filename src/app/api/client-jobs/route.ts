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
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    const parentFolderId = process.env.GDRIVE_PARENT_FOLDER_ID || "1dlZWci9qCHahHpyIpiNqStjWpYCq5s4M";
    const accessToken = await getAccessToken();

    // 1. Search for Client Folder containing email in the name under parent directory
    const q = `mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents and name contains '${email}' and trashed = false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      throw new Error(`Google Drive client folder search failed: ${errText}`);
    }

    const searchData = await searchRes.json();
    const files = searchData.files || [];

    if (files.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    const clientFolderId = files[0].id;

    // 2. List subfolders under this client folder
    const subQ = `mimeType = 'application/vnd.google-apps.folder' and '${clientFolderId}' in parents and trashed = false`;
    const listRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(subQ)}&fields=files(id,name,webViewLink,createdTime)&orderBy=createdTime%20desc`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!listRes.ok) {
      const errText = await listRes.text();
      throw new Error(`Google Drive subfolder listing failed: ${errText}`);
    }

    const listData = await listRes.json();
    const subfolders = listData.files || [];

    // 3. Parse jobs from folder names
    const jobs = subfolders.map((folder: any) => {
      const name = folder.name;
      let jobId = "";
      let topic = name;
      
      const match = name.match(/^(RM-[A-Z0-9]+-[A-Z0-9]+)\s*-\s*(.*)$/);
      if (match) {
        jobId = match[1];
        topic = match[2];
      }
      
      return {
        jobId,
        topic,
        folderId: folder.id,
        link: folder.webViewLink,
        createdTime: folder.createdTime,
      };
    });

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error("Client jobs lookup error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
