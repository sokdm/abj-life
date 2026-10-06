import mongoose from "mongoose";

const MarketplaceListingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    itemId: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ["ACTIVE", "SOLD", "CANCELLED"], default: "ACTIVE", index: true }
  },
  { timestamps: true }
);

MarketplaceListingSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.MarketplaceListing || mongoose.model("MarketplaceListing", MarketplaceListingSchema);
