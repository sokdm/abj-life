import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().max(120),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  identifier: z.string().min(3).max(120),
  password: z.string().min(8).max(128)
});

export const characterSchema = z.object({
  name: z.string().min(2).max(32),
  gender: z.enum(["Male", "Female"]),
  skinTone: z.string().min(2).max(32),
  hairstyle: z.string().min(2).max(32),
  hairColor: z.string().min(2).max(32),
  clothing: z.string().min(2).max(48),
  shoes: z.string().min(2).max(48)
});

export const walletSchema = z.object({
  action: z.enum(["deposit", "withdraw"]),
  amount: z.coerce.number().int().positive().max(500000)
});

export const transferSchema = z.object({
  recipient: z.string().min(3).max(64),
  amount: z.coerce.number().int().positive().max(1000000),
  idempotencyKey: z.string().min(12).max(120)
});

export const purchaseSchema = z.object({
  id: z.string().min(2).max(80),
  mode: z.enum(["BUY", "RENT"]).optional(),
  idempotencyKey: z.string().min(12).max(120)
});

export const equipSchema = z.object({
  itemId: z.string().min(2).max(80)
});

export const notificationActionSchema = z.object({
  action: z.enum(["mark_read", "mark_all_read", "delete"]),
  notificationId: z.string().min(8).max(80).optional()
});

export const friendshipActionSchema = z.object({
  friendshipId: z.string().min(8).max(80).optional(),
  username: z.string().min(3).max(24).optional(),
  action: z.enum(["accept", "decline", "cancel", "remove", "block", "unblock"])
});

export const travelSchema = z.object({
  districtId: z.string().min(2).max(64),
  locationId: z.string().min(2).max(80).optional()
});

export const friendSchema = z.object({
  username: z.string().min(3).max(24)
});

export const messageSchema = z.object({
  recipient: z.string().min(3).max(64),
  body: z.string().min(1).max(500)
});

export const jobTaskSchema = z.object({
  jobId: z.string().min(2).max(80),
  score: z.coerce.number().int().min(0).max(100)
});
