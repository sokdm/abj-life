import mongoose from "mongoose";

const CrewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    logo: { type: String, default: "ABJ" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    reputation: { type: Number, default: 0 },
    wallet: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.Crew || mongoose.model("Crew", CrewSchema);
