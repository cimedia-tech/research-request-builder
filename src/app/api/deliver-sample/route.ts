import { NextRequest, NextResponse } from "next/server";
import { sendSampleReportEmail } from "../../../lib/gmail";

/**
 * /api/deliver-sample — Delivers a styled sample brief via email
 * including a direct payment CTA link to pay for the full package.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, jobId, topic, sampleContent } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const cleanEmail = email.trim();
    const cleanName = name ? name.trim() : "Valued Client";
    const cleanTopic = topic ? topic.trim() : "Requested Research Brief";
    const cleanSampleContent = sampleContent || "No preview generated.";

    // Construct the direct paywall link that pre-fills email/jobId and opens checkout
    const checkoutUrl = `https://www.theresearchmachine.com/?email=${encodeURIComponent(cleanEmail)}&jobId=${encodeURIComponent(jobId)}&pay=true`;

    console.log(`Delivering sample brief for Job ${jobId} to ${cleanEmail}...`);
    
    const sent = await sendSampleReportEmail(
      cleanEmail,
      cleanName,
      jobId,
      cleanTopic,
      cleanSampleContent,
      checkoutUrl
    );

    if (!sent) {
      throw new Error("Failed to send email through Gmail client");
    }

    return NextResponse.json({
      success: true,
      message: `Sample report successfully delivered to ${cleanEmail}.`
    });
  } catch (error) {
    console.error("Deliver sample error:", error);
    return NextResponse.json(
      { error: "Failed to deliver sample brief email", details: String(error) },
      { status: 500 }
    );
  }
}
