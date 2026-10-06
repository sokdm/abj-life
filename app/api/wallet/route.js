import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { walletSchema } from "@/lib/validators";
import { runWalletAction } from "@/services/playerService";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = walletSchema.parse(await request.json());
    await connectDb();
    const player = await runWalletAction(userId, body.action, body.amount);
    return NextResponse.json({ ok: true, player });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Wallet action failed." }, { status: 400 });
  }
}
