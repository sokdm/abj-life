import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

NotificationSchema.index({ player: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
