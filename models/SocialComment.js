import mongoose from "mongoose";

const SocialCommentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "SocialPost", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    body: { type: String, required: true, maxlength: 180 },
    moderationStatus: { type: String, enum: ["visible", "hidden", "flagged"], default: "visible", index: true }
  },
  { timestamps: true }
);

export default mongoose.models.SocialComment || mongoose.model("SocialComment", SocialCommentSchema);
