import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true }],
    lastMessageAt: { type: Date, default: Date.now, index: true },
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }]
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });

export default mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
