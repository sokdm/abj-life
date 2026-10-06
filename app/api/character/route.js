import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { characterSchema } from "@/lib/validators";
import { saveCharacter } from "@/services/playerService";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const character = characterSchema.parse(await request.json());
    await connectDb();
    const player = await saveCharacter(userId, character);
    return NextResponse.json({ ok: true, player });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Character creation failed." }, { status: 400 });
  }
}
