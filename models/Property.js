import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    propertyId: { type: String, required: true, unique: true },
    name: String,
    district: { type: String, index: true },
    type: { type: String, index: true },
    price: Number,
    rentPrice: Number,
    description: String,
    bedrooms: Number,
    bathrooms: Number,
    capacity: Number,
    interiorTheme: String,
    requiredLevel: Number,
    requiredReputation: Number,
    status: { type: String, enum: ["AVAILABLE", "OWNED", "RENTED", "NOT_FOR_SALE"], default: "AVAILABLE", index: true }
  },
  { timestamps: true }
);

export default mongoose.models.Property || mongoose.model("Property", PropertySchema);
