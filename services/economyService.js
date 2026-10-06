import mongoose from "mongoose";
import Player from "@/models/Player";
import Transaction from "@/models/Transaction";
import Notification from "@/models/Notification";
import PropertyOwnership from "@/models/PropertyOwnership";
import InventoryItem from "@/models/InventoryItem";
import VehicleOwnership from "@/models/VehicleOwnership";
import ActionLog from "@/models/ActionLog";
import User from "@/models/User";
import Friendship from "@/models/Friendship";
import { economy, findEconomyItem, makeTransactionReference } from "@/lib/economy";

function assertCanAfford(player, amount) {
  if (amount <= 0) throw new Error("Invalid amount");
  if (player.bankBalance < amount) throw new Error("Not enough bank balance");
}

async function findPlayerByUsernameOrAccount(value, session) {
  const user = await User.findOne({ username: value }).session(session);
  if (user) return Player.findOne({ user: user._id }).session(session);
  return Player.findOne({ accountNumber: value }).session(session);
}

export async function atomicTransfer(userId, recipient, amount, idempotencyKey) {
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const existing = await Transaction.findOne({ idempotencyKey }).session(session);
      const sender = await Player.findOne({ user: userId }).session(session);
      if (!sender) throw new Error("Player not found");
      if (existing) {
        result = sender.toObject();
        return;
      }
      const receiver = await findPlayerByUsernameOrAccount(recipient, session);
      if (!receiver) throw new Error("Recipient not found");
      if (String(receiver._id) === String(sender._id)) throw new Error("You cannot transfer to yourself");
      assertCanAfford(sender, amount);

      const reference = makeTransactionReference();
      sender.bankBalance -= amount;
      receiver.bankBalance += amount;
      await sender.save({ session });
      await receiver.save({ session });
      await Transaction.create([{
        player: sender._id,
        fromPlayer: sender._id,
        toPlayer: receiver._id,
        type: "transfer_sent",
        amount,
        note: `Transfer to ${recipient}`,
        idempotencyKey,
        reference
      }, {
        player: receiver._id,
        fromPlayer: sender._id,
        toPlayer: receiver._id,
        type: "transfer_received",
        amount,
        note: "Incoming ABJ Bank transfer",
        reference
      }], { session });
      await Notification.create([{
        player: sender._id,
        type: "money",
        title: "Transfer Successful",
        message: `${reference}: N${amount.toLocaleString()} sent successfully.`,
        metadata: { reference }
      }, {
        player: receiver._id,
        type: "money",
        title: "Money received",
        message: `You received N${amount.toLocaleString()} from a player.`,
        metadata: { reference }
      }], { session });
      if (amount >= economy.transfer.largeTransfer) {
        await ActionLog.create([{ player: sender._id, type: "large_transfer", severity: "warning", message: "Large player transfer recorded", metadata: { amount, reference } }], { session });
      }
      result = sender.toObject();
      result.lastTransfer = { reference, amount, recipient };
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function purchaseProperty(userId, propertyId, mode, idempotencyKey) {
  const property = findEconomyItem("properties", propertyId);
  if (!property) throw new Error("Property not found");
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const existingTx = await Transaction.findOne({ idempotencyKey }).session(session);
      const player = await Player.findOne({ user: userId }).session(session);
      if (!player) throw new Error("Player not found");
      if (existingTx) {
        result = player.toObject();
        return;
      }
      if (player.level < property.level || player.civilianReputation < property.reputation) throw new Error("Property requirements not met");
      const cost = mode === "RENT" ? property.rentPrice : property.price;
      assertCanAfford(player, cost);
      const existing = await PropertyOwnership.findOne({ player: player._id, propertyId }).session(session);
      if (existing) throw new Error("You already have this property");
      player.bankBalance -= cost;
      player.house = property.name;
      await player.save({ session });
      await PropertyOwnership.create([{ player: player._id, propertyId, mode: mode === "RENT" ? "RENTED" : "OWNED", primaryHome: true, access: "PRIVATE" }], { session });
      const reference = makeTransactionReference();
      await Transaction.create([{ player: player._id, type: mode === "RENT" ? "property_rent" : "property_purchase", amount: cost, note: property.name, idempotencyKey, reference }], { session });
      await Notification.create([{ player: player._id, type: "property", title: mode === "RENT" ? "Property rented" : "Property purchased", message: `${property.name} is now your home.`, metadata: { propertyId, reference } }], { session });
      result = player.toObject();
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function purchaseItem(userId, itemId, idempotencyKey) {
  const item = findEconomyItem("items", itemId);
  if (!item) throw new Error("Item not found");
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const existingTx = await Transaction.findOne({ idempotencyKey }).session(session);
      const player = await Player.findOne({ user: userId }).session(session);
      if (!player) throw new Error("Player not found");
      if (existingTx) {
        result = player.toObject();
        return;
      }
      assertCanAfford(player, item.price);
      const ownedItem = await InventoryItem.findOne({ player: player._id, itemId }).session(session);
      if (ownedItem && !item.stackable) throw new Error("You already own this item");
      player.bankBalance -= item.price;
      await player.save({ session });
      await InventoryItem.findOneAndUpdate(
        { player: player._id, itemId },
        { $setOnInsert: { category: item.category, tradable: item.tradable }, $inc: { quantity: item.stackable ? 1 : 0 } },
        { upsert: true, new: true, session, setDefaultsOnInsert: true }
      );
      await Transaction.create([{ player: player._id, type: "item_purchase", amount: item.price, note: item.name, idempotencyKey, reference: makeTransactionReference() }], { session });
      await Notification.create([{ player: player._id, type: "item", title: "Item purchased", message: `${item.name} added to inventory.`, metadata: { itemId } }], { session });
      result = player.toObject();
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function purchaseVehicle(userId, vehicleId, idempotencyKey) {
  const vehicle = findEconomyItem("vehicles", vehicleId);
  if (!vehicle) throw new Error("Vehicle not found");
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const existingTx = await Transaction.findOne({ idempotencyKey }).session(session);
      const player = await Player.findOne({ user: userId }).session(session);
      if (!player) throw new Error("Player not found");
      if (existingTx) {
        result = player.toObject();
        return;
      }
      if (player.level < vehicle.level || player.civilianReputation < vehicle.reputation) throw new Error("Vehicle requirements not met");
      assertCanAfford(player, vehicle.price);
      player.bankBalance -= vehicle.price;
      await player.save({ session });
      const count = await VehicleOwnership.countDocuments({ player: player._id }).session(session);
      await VehicleOwnership.create([{ player: player._id, vehicleId, nickname: vehicle.model, active: count === 0 }], { session });
      await Transaction.create([{ player: player._id, type: "vehicle_purchase", amount: vehicle.price, note: vehicle.model, idempotencyKey, reference: makeTransactionReference() }], { session });
      await Notification.create([{ player: player._id, type: "vehicle", title: "Vehicle purchased", message: `${vehicle.model} is now in your garage.`, metadata: { vehicleId } }], { session });
      result = player.toObject();
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function getEconomyState(userId) {
  const player = await Player.findOne({ user: userId }).lean();
  if (!player) throw new Error("Player not found");
  const [properties, vehicles, inventory, friends] = await Promise.all([
    PropertyOwnership.find({ player: player._id }).lean(),
    VehicleOwnership.find({ player: player._id }).lean(),
    InventoryItem.find({ player: player._id }).lean(),
    Friendship.find({ $or: [{ requester: player._id }, { recipient: player._id }], status: "accepted" }).lean()
  ]);
  const propertyWorth = properties.filter((owned) => owned.mode === "OWNED").reduce((sum, owned) => sum + (findEconomyItem("properties", owned.propertyId)?.price || 0), 0);
  const vehicleWorth = vehicles.reduce((sum, owned) => sum + (findEconomyItem("vehicles", owned.vehicleId)?.price || 0), 0);
  return {
    netWorth: player.cash + player.bankBalance + propertyWorth + vehicleWorth,
    properties,
    vehicles,
    inventory,
    friendsCount: friends.length,
    catalog: economy
  };
}
