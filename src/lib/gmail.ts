async function getGmailAccessToken(): Promise<string> {
  const clientId = process.env.GDRIVE_CLIENT_ID;
  const clientSecret = process.env.GDRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Gmail credentials are not configured in environment variables");
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
    throw new Error(`Gmail Token refresh failed: ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function sendGmailAlert(subject: string, body: string): Promise<boolean> {
  try {
    const accessToken = await getGmailAccessToken();

    // Format RFC-2822 email message
    const emailParts = [
      `From: me`,
      `To: cimedia316@gmail.com`,
      `Subject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      Buffer.from(body).toString("base64")
    ];

    const rawMessage = emailParts.join("\r\n");

    // Base64url encode the raw message
    const encodedRaw = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const sendRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encodedRaw }),
      }
    );

    if (!sendRes.ok) {
      console.error("Gmail send API failed:", await sendRes.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("sendGmailAlert error:", error);
    return false;
  }
}
