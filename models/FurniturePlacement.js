import mongoose from "mongoose";

const FurniturePlacementSchema = new mongoose.Schema(
  {
    propertyOwnership: { type: mongoose.Schema.Types.ObjectId, ref: "PropertyOwnership", required: true, index: true },
    inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem", required: true },
    slot: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

FurniturePlacementSchema.index({ propertyOwnership: 1, slot: 1 }, { unique: true });

export default mongoose.models.FurniturePlacement || mongoose.model("FurniturePlacement", FurniturePlacementSchema);
