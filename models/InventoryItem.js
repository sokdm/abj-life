import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    itemId: { type: String, required: true, index: true },
    category: { type: String, index: true },
    quantity: { type: Number, default: 1 },
    equipped: { type: Boolean, default: false },
    tradable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

InventoryItemSchema.index({ player: 1, itemId: 1 }, { unique: true });

export default mongoose.models.InventoryItem || mongoose.model("InventoryItem", InventoryItemSchema);
