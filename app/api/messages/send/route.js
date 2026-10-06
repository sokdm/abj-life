import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { messageSchema } from "@/lib/validators";
import { sendDirectMessage } from "@/services/worldService";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = messageSchema.parse(await request.json());
    await connectDb();
    const message = await sendDirectMessage(userId, body.recipient, body.body);
    return NextResponse.json({ ok: true, message });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Message failed." }, { status: 400 });
  }
}
