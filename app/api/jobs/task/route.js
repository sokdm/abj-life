import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { jobTaskSchema } from "@/lib/validators";
import { completeJobTask } from "@/services/worldService";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = jobTaskSchema.parse(await request.json());
    await connectDb();
    const player = await completeJobTask(userId, body.jobId, body.score);
    return NextResponse.json({ ok: true, player });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Job task failed." }, { status: 400 });
  }
}
