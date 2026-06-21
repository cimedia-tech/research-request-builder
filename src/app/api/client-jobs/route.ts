import { NextRequest, NextResponse } from "next/server";
import { readDatabase } from "../../../lib/driveDb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    const db = await readDatabase();
    
    // Filter jobs for this client email
    const cleanEmail = email.toLowerCase().trim();
    const clientJobs = (db.jobs || [])
      .filter((j) => j.requestorEmail.toLowerCase().trim() === cleanEmail)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Map to the shape expected by the frontend
    const jobs = clientJobs.map((job) => ({
      jobId: job.jobId,
      topic: job.topic,
      link: job.gdriveFolderLink,
      createdTime: job.timestamp,
      status: job.status,
      oneParagraphSummary: job.oneParagraphSummary,
      researchType: job.researchType,
      artifacts: job.artifacts,
    }));

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error("Client jobs lookup error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
