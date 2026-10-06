import Player from "@/models/Player";
import Transaction from "@/models/Transaction";
import { starterJobs } from "@/lib/gameData";
import { economy } from "@/lib/economy";

export function makeAccountNumber() {
  return `31${Math.floor(10000000 + Math.random() * 89999999)}`;
}

export async function createStarterPlayer(userId) {
  let accountNumber = makeAccountNumber();
  while (await Player.exists({ accountNumber })) {
    accountNumber = makeAccountNumber();
  }

  return Player.create({
    user: userId,
    accountNumber,
    cash: economy.starterBalance
  });
}

export async function getPlayerForUser(userId) {
  return Player.findOne({ user: userId }).lean();
}

export async function saveCharacter(userId, character) {
  return Player.findOneAndUpdate(
    { user: userId },
    { $set: { character } },
    { new: true, runValidators: true }
  ).lean();
}

export async function runWalletAction(userId, action, amount) {
  const player = await Player.findOne({ user: userId });
  if (!player) throw new Error("Player not found");

  if (action === "deposit") {
    if (player.cash < amount) throw new Error("Not enough cash");
    player.cash -= amount;
    player.bankBalance += amount;
  }

  if (action === "withdraw") {
    if (player.bankBalance < amount) throw new Error("Not enough bank balance");
    player.bankBalance -= amount;
    player.cash += amount;
  }

  await player.save();
  await Transaction.create({
    player: player._id,
    type: action,
    amount,
    note: action === "deposit" ? "Cash deposited to ABJ Bank" : "Cash withdrawn from ABJ Bank"
  });

  return player.toObject();
}

export async function completeJob(userId, jobTitle) {
  const job = starterJobs.find((item) => item.title === jobTitle);
  if (!job) throw new Error("Invalid job");

  const player = await Player.findOne({ user: userId });
  if (!player) throw new Error("Player not found");
  if (player.level < job.level) throw new Error("Level too low for this job");
  if (player.energy < 15) throw new Error("Not enough energy");

  player.cash += job.pay;
  player.xp += job.xp;
  player.energy -= 15;
  player.hunger = Math.min(100, player.hunger + 8);
  player.job = job.title;
  player.skills[job.skill] = (player.skills[job.skill] || 0) + 1;

  if (player.xp >= player.level * 100) {
    player.xp -= player.level * 100;
    player.level += 1;
    player.energy = 100;
  }

  await player.save();
  await Transaction.create({
    player: player._id,
    type: "job_payment",
    amount: job.pay,
    note: `${job.title} shift completed`
  });

  return player.toObject();
}
