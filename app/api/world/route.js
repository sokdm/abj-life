import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { districtCatalog, jobCatalog, locationCatalog } from "@/lib/worldData";
import { getWorldState } from "@/services/worldService";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDb();
    const state = await getWorldState(userId);
    return NextResponse.json({ ok: true, ...state, districts: districtCatalog, jobs: jobCatalog, locations: locationCatalog });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to load world." }, { status: 400 });
  }
}
