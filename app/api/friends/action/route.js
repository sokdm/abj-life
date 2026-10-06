import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { friendshipActionSchema } from "@/lib/validators";
import { updateFriendship } from "@/services/socialService";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = friendshipActionSchema.parse(await request.json());
    await connectDb();
    const friendship = await updateFriendship(userId, body.action, body.friendshipId, body.username);
    return NextResponse.json({ ok: true, friendship });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Friend action failed." }, { status: 400 });
  }
}
