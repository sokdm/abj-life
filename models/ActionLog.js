import mongoose from "mongoose";

const ActionLogSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", index: true },
    type: { type: String, required: true, index: true },
    severity: { type: String, enum: ["info", "warning", "critical"], default: "info" },
    message: { type: String, required: true },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

ActionLogSchema.index({ type: 1, createdAt: -1 });

export default mongoose.models.ActionLog || mongoose.model("ActionLog", ActionLogSchema);
