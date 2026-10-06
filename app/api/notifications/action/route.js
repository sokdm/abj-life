import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { notificationActionSchema } from "@/lib/validators";
import { updateNotification } from "@/services/socialService";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = notificationActionSchema.parse(await request.json());
    await connectDb();
    const notification = await updateNotification(userId, body.action, body.notificationId);
    return NextResponse.json({ ok: true, notification });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Notification action failed." }, { status: 400 });
  }
}
