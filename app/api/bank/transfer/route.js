import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { transferSchema } from "@/lib/validators";
import { atomicTransfer } from "@/services/economyService";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = transferSchema.parse(await request.json());
    await connectDb();
    const player = await atomicTransfer(userId, body.recipient, body.amount, body.idempotencyKey);
    return NextResponse.json({ ok: true, player });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Transfer failed." }, { status: 400 });
  }
}
