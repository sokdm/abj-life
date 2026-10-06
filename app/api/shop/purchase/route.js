import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { purchaseSchema } from "@/lib/validators";
import { purchaseItem } from "@/services/economyService";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = purchaseSchema.parse(await request.json());
    await connectDb();
    const player = await purchaseItem(userId, body.id, body.idempotencyKey);
    return NextResponse.json({ ok: true, player });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Item purchase failed." }, { status: 400 });
  }
}
