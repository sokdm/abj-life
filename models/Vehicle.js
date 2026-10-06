import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true },
    brand: String,
    model: String,
    category: { type: String, index: true },
    price: Number,
    speed: Number,
    comfort: Number,
    status: Number,
    requiredLevel: Number,
    requiredReputation: Number,
    description: String
  },
  { timestamps: true }
);

export default mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema);
