import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Player", index: true },
    name: { type: String, required: true },
    businessType: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    locationId: { type: String, required: true, index: true },
    level: { type: Number, default: 1 },
    rating: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    inventory: { type: [String], default: [] },
    open: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.Business || mongoose.model("Business", BusinessSchema);
