import Player from "@/models/Player";
import PlayerWorldState from "@/models/PlayerWorldState";
import MarketplaceListing from "@/models/MarketplaceListing";
import Crew from "@/models/Crew";
import CrewMembership from "@/models/CrewMembership";
import SocialPost from "@/models/SocialPost";
import Business from "@/models/Business";
import ActionLog from "@/models/ActionLog";
import { getNigeriaTime } from "@/lib/time";
import { businessTypes, publicVenues, walkableLayouts } from "@/lib/phase4Data";

function clean(value, max = 120) {
  return String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function getPhase4State(userId) {
  const player = await Player.findOne({ user: userId }).lean();
  if (!player) throw new Error("Player not found");
  const worldState = await PlayerWorldState.findOneAndUpdate(
    { player: player._id },
    { $setOnInsert: { player: player._id, district: player.currentDistrict, locationId: player.currentLocation } },
    { upsert: true, new: true }
  ).lean();
  const [listings, crews, posts, businesses] = await Promise.all([
    MarketplaceListing.find({ status: "ACTIVE" }).sort({ createdAt: -1 }).limit(20).lean(),
    CrewMembership.find({ player: player._id, status: "active" }).populate("crew").lean(),
    SocialPost.find({ moderationStatus: "visible" }).sort({ createdAt: -1 }).limit(20).lean(),
    Business.find({ open: true }).sort({ rating: -1 }).limit(12).lean()
  ]);

  return {
    serverTime: getNigeriaTime(),
    worldState,
    layouts: walkableLayouts,
    venues: publicVenues,
    marketplace: listings,
    crews,
    socialFeed: posts,
    businesses,
    businessTypes
  };
}

export async function updateWorldState(userId, locationId, position, status) {
  const player = await Player.findOne({ user: userId });
  if (!player) throw new Error("Player not found");
  const layout = walkableLayouts[locationId || player.currentLocation] || walkableLayouts["starter-apartment"];
  const x = Math.max(0, Math.min(layout.width - 1, Math.round(position?.x ?? layout.spawn.x)));
  const y = Math.max(0, Math.min(layout.height - 1, Math.round(position?.y ?? layout.spawn.y)));
  return PlayerWorldState.findOneAndUpdate(
    { player: player._id },
    {
      district: player.currentDistrict,
      locationId: layout.id,
      position: { x, y },
      status: status || "Available",
      lastLocationUpdate: new Date()
    },
    { upsert: true, new: true }
  ).lean();
}

export async function createSocialPost(userId, body) {
  const player = await Player.findOne({ user: userId });
  if (!player) throw new Error("Player not found");
  return SocialPost.create({ author: player._id, body: clean(body, 280) });
}

export async function createCrew(userId, name) {
  const player = await Player.findOne({ user: userId });
  if (!player) throw new Error("Player not found");
  const crew = await Crew.create({ owner: player._id, name: clean(name, 32) });
  await CrewMembership.create({ crew: crew._id, player: player._id, role: "owner" });
  return crew.toObject();
}

export async function logMovementAnomaly(userId, message, metadata = {}) {
  const player = await Player.findOne({ user: userId }).lean();
  await ActionLog.create({ player: player?._id, type: "movement_anomaly", severity: "warning", message, metadata });
}
