import mongoose from "mongoose";

const CharacterSchema = new mongoose.Schema(
  {
    name: String,
    gender: String,
    skinTone: String,
    hairstyle: String,
    hairColor: String,
    clothing: String,
    shoes: String
  },
  { _id: false }
);

const PlayerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    character: CharacterSchema,
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    cash: { type: Number, default: 25000 },
    bankBalance: { type: Number, default: 0 },
    accountNumber: { type: String, required: true, unique: true },
    job: { type: String, default: "Unemployed" },
    business: { type: String, default: "None" },
    house: { type: String, default: "Starter apartment option" },
    vehicles: { type: [String], default: [] },
    inventory: { type: [String], default: ["Basic clothing", "Starter phone"] },
    energy: { type: Number, default: 100 },
    hunger: { type: Number, default: 20 },
    health: { type: Number, default: 100 },
    civilianReputation: { type: Number, default: 10 },
    businessReputation: { type: Number, default: 0 },
    streetReputation: { type: Number, default: 0 },
    wantedLevel: { type: Number, default: 0, min: 0, max: 3 },
    currentDistrict: { type: String, default: "kubwa", index: true },
    currentLocation: { type: String, default: "starter-apartment", index: true },
    happiness: { type: Number, default: 70 },
    publicStatus: { type: String, default: "Settling into Abuja" },
    skills: {
      Driving: { type: Number, default: 0 },
      Business: { type: Number, default: 0 },
      Technology: { type: Number, default: 0 },
      Fitness: { type: Number, default: 0 },
      Communication: { type: Number, default: 0 },
      Mechanics: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export default mongoose.models.Player || mongoose.model("Player", PlayerSchema);
