import mongoose from "mongoose";

const SocialPostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    body: { type: String, required: true, maxlength: 280 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    moderationStatus: { type: String, enum: ["visible", "hidden", "flagged"], default: "visible", index: true }
  },
  { timestamps: true }
);

SocialPostSchema.index({ createdAt: -1 });

export default mongoose.models.SocialPost || mongoose.model("SocialPost", SocialPostSchema);
