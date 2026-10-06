import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    body: { type: String, required: true, maxlength: 500 },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }]
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
