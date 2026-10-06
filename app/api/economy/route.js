import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { getEconomyState } from "@/services/economyService";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDb();
    const state = await getEconomyState(userId);
    return NextResponse.json({ ok: true, ...state });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to load economy." }, { status: 400 });
  }
}
