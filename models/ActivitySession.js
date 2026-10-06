import mongoose from "mongoose";

const ActivitySessionSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    activityId: { type: String, required: true, index: true },
    sourceId: { type: String, required: true },
    duration: { type: Number, required: true },
    status: { type: String, enum: ["started", "completed"], default: "started", index: true },
    effects: { type: Object, default: {} },
    completesAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

ActivitySessionSchema.index({ player: 1, status: 1 });

export default mongoose.models.ActivitySession || mongoose.model("ActivitySession", ActivitySessionSchema);
