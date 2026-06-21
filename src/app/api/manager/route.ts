import { NextRequest, NextResponse } from "next/server";
import { readDatabase, updateJobStatusInDb } from "../../../lib/driveDb";
import { saveToDispatchQueue } from "../submit/route";

export async function GET(request: NextRequest) {
  try {
    const db = await readDatabase();
    return NextResponse.json({
      jobs: db.jobs || [],
      researchTypes: db.researchTypes || [],
    });
  } catch (error: any) {
    console.error("Manager GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const db = await readDatabase();
    const job = (db.jobs || []).find((j) => j.jobId === jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // 1. Update status in Google Drive database JSON
    await updateJobStatusInDb(jobId, "approved");

    // 2. Save to local dispatch queue for local agent executor
    const dispatched = await saveToDispatchQueue(
      job.jobId,
      job.detectedDivision,
      job.originalQuestion,
      job.briefPrompt,
      job.timestamp,
      job.requestorName,
      job.requestorEmail,
      job.gdriveFolderLink
    );

    return NextResponse.json({
      success: true,
      jobId,
      dispatched,
      message: `Job ${jobId} successfully approved and dispatched.`,
    });
  } catch (error: any) {
    console.error("Manager POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
