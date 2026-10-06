import mongoose from "mongoose";

const CrewMembershipSchema = new mongoose.Schema(
  {
    crew: { type: mongoose.Schema.Types.ObjectId, ref: "Crew", required: true, index: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    role: { type: String, enum: ["owner", "member"], default: "member" },
    status: { type: String, enum: ["invited", "active", "left"], default: "active", index: true }
  },
  { timestamps: true }
);

CrewMembershipSchema.index({ crew: 1, player: 1 }, { unique: true });

export default mongoose.models.CrewMembership || mongoose.model("CrewMembership", CrewMembershipSchema);
