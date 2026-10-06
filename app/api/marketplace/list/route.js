import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import Player from "@/models/Player";
import InventoryItem from "@/models/InventoryItem";
import MarketplaceListing from "@/models/MarketplaceListing";

export async function POST(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { itemId, price } = await request.json();
    const cleanItemId = String(itemId || "").trim().slice(0, 80);
    const cleanPrice = Number(price);
    if (!cleanItemId || !Number.isInteger(cleanPrice) || cleanPrice <= 0) {
      return NextResponse.json({ error: "Invalid listing." }, { status: 400 });
    }
    await connectDb();
    const player = await Player.findOne({ user: userId });
    if (!player) throw new Error("Player not found");
    const item = await InventoryItem.findOne({ player: player._id, itemId: cleanItemId, tradable: true });
    if (!item || item.quantity < 1) throw new Error("You do not own a tradable copy of this item");
    const listing = await MarketplaceListing.create({ seller: player._id, itemId: cleanItemId, price: cleanPrice });
    return NextResponse.json({ ok: true, listing });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Listing failed." }, { status: 400 });
  }
}
