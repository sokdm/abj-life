import Friendship from "@/models/Friendship";
import Notification from "@/models/Notification";
import Player from "@/models/Player";
import User from "@/models/User";

export async function getSocialState(userId) {
  const player = await Player.findOne({ user: userId }).lean();
  if (!player) throw new Error("Player not found");
  const friendships = await Friendship.find({ $or: [{ requester: player._id }, { recipient: player._id }] }).sort({ updatedAt: -1 }).lean();
  return { friendships };
}

export async function updateFriendship(userId, action, friendshipId, username) {
  const player = await Player.findOne({ user: userId });
  if (!player) throw new Error("Player not found");

  if (action === "block" && username) {
    const user = await User.findOne({ username });
    const target = user ? await Player.findOne({ user: user._id }) : null;
    if (!target) throw new Error("Player not found");
    return Friendship.findOneAndUpdate(
      { requester: player._id, recipient: target._id },
      { status: "blocked" },
      { upsert: true, new: true }
    ).lean();
  }

  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) throw new Error("Friendship not found");
  const isRequester = String(friendship.requester) === String(player._id);
  const isRecipient = String(friendship.recipient) === String(player._id);
  if (!isRequester && !isRecipient) throw new Error("Not allowed");

  if (action === "accept") {
    if (!isRecipient || friendship.status !== "pending") throw new Error("Cannot accept this request");
    friendship.status = "accepted";
    await Notification.create({ player: friendship.requester, type: "friend", title: "Friend accepted", message: "Your friend request was accepted." });
  }
  if (action === "decline") {
    if (!isRecipient || friendship.status !== "pending") throw new Error("Cannot decline this request");
    friendship.status = "declined";
  }
  if (action === "cancel") {
    if (!isRequester || friendship.status !== "pending") throw new Error("Cannot cancel this request");
    await friendship.deleteOne();
    return { deleted: true };
  }
  if (action === "remove") {
    if (friendship.status !== "accepted") throw new Error("Cannot remove this relationship");
    await friendship.deleteOne();
    return { deleted: true };
  }
  if (action === "unblock") {
    if (friendship.status !== "blocked") throw new Error("Not blocked");
    await friendship.deleteOne();
    return { deleted: true };
  }
  await friendship.save();
  return friendship.toObject();
}

export async function updateNotification(userId, action, notificationId) {
  const player = await Player.findOne({ user: userId });
  if (!player) throw new Error("Player not found");
  if (action === "mark_all_read") {
    await Notification.updateMany({ player: player._id }, { read: true });
    return { ok: true };
  }
  const notification = await Notification.findOne({ _id: notificationId, player: player._id });
  if (!notification) throw new Error("Notification not found");
  if (action === "mark_read") {
    notification.read = true;
    await notification.save();
    return notification.toObject();
  }
  if (action === "delete") {
    await notification.deleteOne();
    return { deleted: true };
  }
  return notification.toObject();
}
