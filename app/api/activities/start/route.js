import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import Player from "@/models/Player";
import ActivitySession from "@/models/ActivitySession";

const effectsByActivity = {
  Sleep: { energy: 18, comfort: 8 },
  Nap: { energy: 10 },
  Relax: { fun: 8, comfort: 8 },
  "Sit & Chill": { social: 6, fun: 4 },
  "Watch Show": { fun: 10 },
  "Take Shower": { hygiene: 18 },
  Eat: { hunger: 18 },
  "Lift Weights": { energy: -6, health: 4 },
  "Run on Treadmill": { energy: -8, health: 5 },
  Yoga: { energy: 4, comfort: 8 }
};

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { activityId, sourceId, duration = 8 } = await request.json();
    const cleanActivity = String(activityId || "").slice(0, 80);
    const cleanSource = String(sourceId || "world").slice(0, 80);
    if (!cleanActivity || duration < 3 || duration > 60) {
      return NextResponse.json({ error: "Invalid activity." }, { status: 400 });
    }
    await connectDb();
    const player = await Player.findOne({ user: userId });
    if (!player) throw new Error("Player not found");
    const active = await ActivitySession.findOne({ player: player._id, status: "started" });
    if (active && active.completesAt > new Date()) throw new Error("Activity already in progress");
    const session = await ActivitySession.create({
      player: player._id,
      activityId: cleanActivity,
      sourceId: cleanSource,
      duration,
      effects: effectsByActivity[cleanActivity] || {},
      completesAt: new Date(Date.now() + duration * 1000)
    });
    return NextResponse.json({ ok: true, activity: session });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Activity failed." }, { status: 400 });
  }
}
