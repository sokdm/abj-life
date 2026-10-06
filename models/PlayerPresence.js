import mongoose from "mongoose";

const PlayerPresenceSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, unique: true },
    state: { type: String, enum: ["Online", "Away", "Busy", "Offline"], default: "Offline", index: true },
    lastSeen: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.PlayerPresence || mongoose.model("PlayerPresence", PlayerPresenceSchema);
