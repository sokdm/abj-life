import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["player", "admin"], default: "player" },
    suspended: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
