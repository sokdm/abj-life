import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { createCrew } from "@/services/phase4Service";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { name } = await request.json();
    await connectDb();
    const crew = await createCrew(userId, name);
    return NextResponse.json({ ok: true, crew });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Crew creation failed." }, { status: 400 });
  }
}
