import mongoose from "mongoose";

const PropertyOwnershipSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    propertyId: { type: String, required: true, index: true },
    mode: { type: String, enum: ["OWNED", "RENTED"], required: true, index: true },
    primaryHome: { type: Boolean, default: false, index: true },
    access: { type: String, enum: ["PRIVATE", "FRIENDS", "INVITE_ONLY"], default: "PRIVATE" },
    visitors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }]
  },
  { timestamps: true }
);

PropertyOwnershipSchema.index({ player: 1, propertyId: 1 }, { unique: true });

export default mongoose.models.PropertyOwnership || mongoose.model("PropertyOwnership", PropertyOwnershipSchema);
