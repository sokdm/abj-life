import mongoose from "mongoose";

const LocationMessageSchema = new mongoose.Schema(
  {
    locationId: { type: String, required: true, index: true },
    senderUserId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    avatar: { type: String, default: "ABJ" },
    body: { type: String, required: true, maxlength: 240 },
    edited: { type: Boolean, default: false },
    moderationStatus: { type: String, enum: ["visible", "hidden", "flagged"], default: "visible", index: true }
  },
  { timestamps: true }
);

LocationMessageSchema.index({ locationId: 1, createdAt: -1 });

export default mongoose.models.LocationMessage || mongoose.model("LocationMessage", LocationMessageSchema);
