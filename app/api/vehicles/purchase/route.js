import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { purchaseSchema } from "@/lib/validators";
import { purchaseVehicle } from "@/services/economyService";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = purchaseSchema.parse(await request.json());
    await connectDb();
    const player = await purchaseVehicle(userId, body.id, body.idempotencyKey);
    return NextResponse.json({ ok: true, player });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Vehicle purchase failed." }, { status: 400 });
  }
}
