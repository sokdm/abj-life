import mongoose from "mongoose";

const MarketplaceTransactionSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "MarketplaceListing", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    itemId: { type: String, required: true },
    price: { type: Number, required: true },
    reference: { type: String, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.MarketplaceTransaction || mongoose.model("MarketplaceTransaction", MarketplaceTransactionSchema);
