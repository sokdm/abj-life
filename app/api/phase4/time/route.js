import { NextResponse } from "next/server";
import { getNigeriaTime } from "@/lib/time";

export async function GET() {
  return NextResponse.json({ ok: true, serverTime: getNigeriaTime() });
}
