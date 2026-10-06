import Player from "@/models/Player";
import Transaction from "@/models/Transaction";
import Notification from "@/models/Notification";
import JobSession from "@/models/JobSession";
import Friendship from "@/models/Friendship";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import ActionLog from "@/models/ActionLog";
import VehicleOwnership from "@/models/VehicleOwnership";
import { canAccessDistrict, getDistrict, getLocation, jobCatalog, locationCatalog } from "@/lib/worldData";

function sanitizeText(value, max = 500) {
  return String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function createNotification(playerId, type, title, message, metadata = {}) {
  return Notification.create({
    player: playerId,
    type,
    title: sanitizeText(title, 120),
    message: sanitizeText(message, 500),
    metadata
  });
}

export async function getWorldState(userId) {
  const player = await Player.findOne({ user: userId }).lean();
  if (!player) throw new Error("Player not found");
  const notifications = await Notification.find({ player: player._id }).sort({ createdAt: -1 }).limit(20).lean();
  const transactions = await Transaction.find({ player: player._id }).sort({ createdAt: -1 }).limit(12).lean();
  return { player, notifications, transactions, locations: locationCatalog };
}

export async function travelToDistrict(userId, districtId, locationId) {
  const district = getDistrict(districtId);
  if (!district) throw new Error("Unknown district");
  const player = await Player.findOne({ user: userId });
  if (!player) throw new Error("Player not found");
  if (!canAccessDistrict(player, district)) throw new Error("District is still locked");
  const activeVehicle = await VehicleOwnership.findOne({ player: player._id, active: true }).lean();
  const travelCost = activeVehicle ? 0 : district.travelCost;
  if (player.cash < travelCost) throw new Error("Not enough cash for travel");

  const location = locationCatalog.find((item) => item.district === district.id && (!locationId || item.id === locationId));
  if (!location) throw new Error("No available location in this district");
  const targetLocation = getLocation(location.id);
  const req = targetLocation.requirements;
  if (player.level < req.level || player.cash + player.bankBalance < req.wealth || player.civilianReputation < req.reputation) {
    throw new Error("Location requirements not met");
  }

  player.cash -= travelCost;
  player.currentDistrict = district.id;
  player.currentLocation = targetLocation.id;
  player.energy = Math.max(0, player.energy - 5);
  await player.save();
  await Transaction.create({ player: player._id, type: "travel", amount: travelCost, note: activeVehicle ? `Drove to ${district.name}` : `Travel to ${district.name}` });
  await createNotification(player._id, "travel", "Travel complete", `Arrived at ${targetLocation.name}.`, { districtId: district.id, locationId: targetLocation.id, activeVehicle: Boolean(activeVehicle) });
  return player.toObject();
}

export async function transferMoney(userId, recipient, amount, idempotencyKey) {
  const sender = await Player.findOne({ user: userId });
  if (!sender) throw new Error("Player not found");
  const duplicate = await Transaction.findOne({ idempotencyKey });
  if (duplicate) return sender.toObject();
  if (sender.bankBalance < amount) throw new Error("Not enough bank balance");

  const recipientUser = await User.findOne({ username: recipient }).lean();
  const receiver = recipientUser
    ? await Player.findOne({ user: recipientUser._id })
    : await Player.findOne({ accountNumber: recipient });
  if (!receiver) throw new Error("Recipient not found");
  if (String(receiver._id) === String(sender._id)) throw new Error("You cannot transfer to yourself");

  sender.bankBalance -= amount;
  receiver.bankBalance += amount;
  await sender.save();
  await receiver.save();

  await Transaction.create({
    player: sender._id,
    fromPlayer: sender._id,
    toPlayer: receiver._id,
    type: "transfer_sent",
    amount,
    note: `Transfer to ${recipient}`,
    idempotencyKey
  });
  await Transaction.create({
    player: receiver._id,
    fromPlayer: sender._id,
    toPlayer: receiver._id,
    type: "transfer_received",
    amount,
    note: "Incoming ABJ Bank transfer"
  });
  await createNotification(sender._id, "money", "Transfer successful", `Sent N${amount.toLocaleString()} successfully.`);
  await createNotification(receiver._id, "money", "Money received", `You received N${amount.toLocaleString()} from another player.`);
  if (amount >= 250000) {
    await ActionLog.create({ player: sender._id, type: "large_transfer", severity: "warning", message: "Large player transfer recorded", metadata: { amount } });
  }
  return sender.toObject();
}

export async function completeJobTask(userId, jobId, score) {
  const job = jobCatalog.find((item) => item.id === jobId);
  if (!job) throw new Error("Invalid job");
  const player = await Player.findOne({ user: userId });
  if (!player) throw new Error("Player not found");
  if (player.level < job.level) throw new Error("Level too low for this job");
  if (player.energy < 10) throw new Error("Not enough energy");

  const multiplier = Math.max(0.35, Math.min(1.25, score / 80));
  const reward = Math.round(job.salary * multiplier);
  const xp = Math.round(job.xp * multiplier);
  player.cash += reward;
  player.xp += xp;
  player.energy -= 10;
  player.hunger = Math.min(100, player.hunger + 6);
  player.job = job.name;
  player.skills[job.skill] = (player.skills[job.skill] || 0) + 1;
  if (player.xp >= player.level * 100) {
    player.xp -= player.level * 100;
    player.level += 1;
    player.energy = Math.min(100, player.energy + 35);
  }
  await player.save();
  await JobSession.create({ player: player._id, jobId, task: job.task, status: "completed", score, reward, xp });
  await Transaction.create({ player: player._id, type: "job_payment", amount: reward, note: `${job.name} task completed` });
  await createNotification(player._id, "job", "Job complete", `Earned N${reward.toLocaleString()} from ${job.company}.`, { jobId, score });
  return player.toObject();
}

export async function sendFriendRequest(userId, username) {
  const requester = await Player.findOne({ user: userId });
  const targetUser = await User.findOne({ username });
  if (!requester || !targetUser) throw new Error("Player not found");
  const recipient = await Player.findOne({ user: targetUser._id });
  if (!recipient || String(recipient._id) === String(requester._id)) throw new Error("Invalid friend request");
  const friendship = await Friendship.findOneAndUpdate(
    { requester: requester._id, recipient: recipient._id },
    { $setOnInsert: { status: "pending" } },
    { upsert: true, new: true }
  );
  await createNotification(recipient._id, "friend", "Friend request", "A player sent you a friend request.");
  return friendship.toObject();
}

export async function sendDirectMessage(userId, recipient, body) {
  const sender = await Player.findOne({ user: userId });
  const targetUser = await User.findOne({ username: recipient }).lean();
  const receiver = targetUser ? await Player.findOne({ user: targetUser._id }) : await Player.findOne({ accountNumber: recipient });
  if (!sender || !receiver) throw new Error("Recipient not found");
  const participants = [sender._id, receiver._id].sort((a, b) => String(a).localeCompare(String(b)));
  const conversation = await Conversation.findOneAndUpdate(
    { participants: { $all: participants, $size: 2 } },
    { $set: { participants, lastMessageAt: new Date() } },
    { upsert: true, new: true }
  );
  const message = await Message.create({ conversation: conversation._id, sender: sender._id, body: sanitizeText(body), readBy: [sender._id] });
  await createNotification(receiver._id, "message", "New message", "You received a new ABJ ONE message.", { conversation: conversation._id });
  return message.toObject();
}
