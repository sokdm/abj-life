import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { createSocialPost } from "@/services/phase4Service";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { body } = await request.json();
    await connectDb();
    const post = await createSocialPost(userId, body);
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Post failed." }, { status: 400 });
  }
}
