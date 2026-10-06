import mongoose from "mongoose";

const JobSessionSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    jobId: { type: String, required: true, index: true },
    task: { type: String, required: true },
    status: { type: String, enum: ["started", "completed", "failed"], default: "started", index: true },
    score: { type: Number, default: 0 },
    reward: { type: Number, default: 0 },
    xp: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.JobSession || mongoose.model("JobSession", JobSessionSchema);
