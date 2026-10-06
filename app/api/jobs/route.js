import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { completeJob } from "@/services/playerService";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobTitle } = await request.json();
    await connectDb();
    const player = await completeJob(userId, jobTitle);
    return NextResponse.json({ ok: true, player });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Job failed." }, { status: 400 });
  }
}
