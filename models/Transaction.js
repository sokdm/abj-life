import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["completed", "failed"], default: "completed" },
    note: { type: String, default: "" },
    fromPlayer: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    toPlayer: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    idempotencyKey: { type: String },
    reference: { type: String, index: true }
  },
  { timestamps: true }
);

TransactionSchema.index({ player: 1, createdAt: -1 });
TransactionSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
