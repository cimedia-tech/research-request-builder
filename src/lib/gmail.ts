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

export async function sendSampleReportEmail(
  toEmail: string,
  toName: string,
  jobId: string,
  topic: string,
  sampleContent: string,
  checkoutUrl: string
): Promise<boolean> {
  try {
    const accessToken = await getGmailAccessToken();
    const cleanName = toName || "Valued Client";
    const cleanTopic = topic || "Requested Research Topic";

    const subject = `🔬 Research Sample Preview: ${cleanTopic.substring(0, 50)}${cleanTopic.length > 50 ? "..." : ""}`;

    // Premium HTML template
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #FAF8F5;
      color: #2A2724;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #FAF8F5;
      padding: 20px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #ECE7DF;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .header {
      background-color: #FAF8F5;
      padding: 24px;
      text-align: center;
      border-bottom: 1px solid #ECE7DF;
    }
    .brand-title {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #2F6A6A;
      margin: 0 0 4px 0;
      font-weight: 800;
    }
    .brand-sub {
      font-size: 18px;
      color: #C1694F;
      margin: 0;
      font-family: Georgia, serif;
      font-style: italic;
    }
    .content {
      padding: 32px 24px;
    }
    .job-badge {
      display: inline-block;
      background-color: #FAF8F5;
      border: 1px solid #ECE7DF;
      color: #2A2724;
      font-family: monospace;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    .greeting {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .topic-card {
      background-color: #FAF8F5;
      border-left: 4px solid #C1694F;
      padding: 16px;
      margin-bottom: 24px;
      border-radius: 0 4px 4px 0;
    }
    .topic-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #8C847B;
      margin-bottom: 4px;
    }
    .topic-text {
      font-size: 15px;
      font-weight: bold;
      margin: 0;
    }
    .brief-preview {
      border: 1px solid #ECE7DF;
      background-color: #FAF8F5;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 32px;
      max-height: 250px;
      overflow-y: auto;
    }
    .brief-title {
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
      color: #2F6A6A;
      margin-bottom: 12px;
      border-bottom: 1px solid #ECE7DF;
      padding-bottom: 6px;
    }
    .brief-text {
      font-size: 13px;
      line-height: 1.6;
      color: #55504A;
      white-space: pre-wrap;
      margin: 0;
    }
    .cta-section {
      text-align: center;
      padding: 24px;
      background-color: #FAF8F5;
      border-top: 1px solid #ECE7DF;
      border-bottom: 1px solid #ECE7DF;
      margin-bottom: 32px;
    }
    .cta-button {
      display: inline-block;
      background-color: #C1694F;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: bold;
      padding: 14px 28px;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(193, 105, 79, 0.2);
      transition: background-color 0.2s;
    }
    .cta-text {
      font-size: 12px;
      color: #8C847B;
      margin-top: 8px;
      margin-bottom: 0;
    }
    .footer {
      padding: 24px;
      text-align: center;
      font-size: 11px;
      color: #8C847B;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand-title">Vantage Intelligence Group</div>
        <div class="brand-sub">The Research Machine™</div>
      </div>
      <div class="content">
        <div class="job-badge">Job Ref: ${jobId}</div>
        <div class="greeting">
          Hello <strong>${cleanName}</strong>,<br><br>
          We have generated your tailored research outline and initial alignment coordinates. Below is the preview of your research brief. 
        </div>
        
        <div class="topic-card">
          <div class="topic-label">Research Focus</div>
          <div class="topic-text">${cleanTopic}</div>
        </div>

        <div class="brief-preview">
          <div class="brief-title">Tailored Brief & Initial Insights</div>
          <div class="brief-text">${sampleContent}</div>
        </div>

        <div class="cta-section">
          <a href="${checkoutUrl}" class="cta-button" target="_blank">🔓 Unlock Full 9-Asset Deliverable Stack</a>
          <p class="cta-text">Includes: Full Report, Solutions Framework, Data Appendix, Interactive Web Portal, and more.</p>
        </div>
        
        <div class="greeting" style="font-size: 14px; color: #55504A;">
          Once payment is unlocked, the Research Machine's 32-agent team will immediately begin full evidence-based synthesis and deliver all assets directly to your Google Drive workspace and Telegram control center.
        </div>
      </div>
      <div class="footer">
        This email was sent by Vantage Intelligence Group.<br>
        © 2026 Vantage Intelligence Group. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Format RFC-2822 email message
    const emailParts = [
      `From: Vantage Intelligence Group <me>`,
      `To: ${toName ? `${toName} <${toEmail}>` : toEmail}`,
      `Subject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      Buffer.from(htmlBody).toString("base64")
    ];

    const rawMessage = emailParts.join("\r\n");

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
    console.error("sendSampleReportEmail error:", error);
    return false;
  }
}

