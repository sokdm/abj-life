import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { friendSchema } from "@/lib/validators";
import { sendFriendRequest } from "@/services/worldService";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = friendSchema.parse(await request.json());
    await connectDb();
    const friendship = await sendFriendRequest(userId, body.username);
    return NextResponse.json({ ok: true, friendship });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Friend request failed." }, { status: 400 });
  }
}
