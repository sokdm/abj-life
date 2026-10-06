import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true, unique: true },
    name: String,
    category: { type: String, index: true },
    price: Number,
    rarity: String,
    description: String,
    image: String,
    requirements: { type: Object, default: {} },
    tradable: Boolean,
    stackable: Boolean,
    slot: String
  },
  { timestamps: true }
);

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
