import mongoose from "mongoose";

const VehicleOwnershipSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    vehicleId: { type: String, required: true, index: true },
    nickname: String,
    active: { type: Boolean, default: false, index: true },
    status: { type: Number, default: 100 },
    garageProperty: { type: String }
  },
  { timestamps: true }
);

VehicleOwnershipSchema.index({ player: 1, vehicleId: 1 }, { unique: true });

export default mongoose.models.VehicleOwnership || mongoose.model("VehicleOwnership", VehicleOwnershipSchema);
