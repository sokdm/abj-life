import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { getPhase4State } from "@/services/phase4Service";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDb();
    const state = await getPhase4State(userId);
    return NextResponse.json({ ok: true, ...state });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to load living city." }, { status: 400 });
  }
}
