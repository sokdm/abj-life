import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { travelSchema } from "@/lib/validators";
import { travelToDistrict } from "@/services/worldService";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = travelSchema.parse(await request.json());
    await connectDb();
    const player = await travelToDistrict(userId, body.districtId, body.locationId);
    return NextResponse.json({ ok: true, player });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Travel failed." }, { status: 400 });
  }
}
