import mongoose from "mongoose";

const PlayerWorldStateSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, unique: true },
    district: { type: String, default: "kubwa", index: true },
    locationId: { type: String, default: "starter-apartment", index: true },
    position: {
      x: { type: Number, default: 5 },
      y: { type: Number, default: 6 }
    },
    status: { type: String, enum: ["Available", "Busy", "Away", "Do Not Disturb"], default: "Available", index: true },
    lastLocationUpdate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.PlayerWorldState || mongoose.model("PlayerWorldState", PlayerWorldStateSchema);
