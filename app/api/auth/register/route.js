import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import User from "@/models/User";
import { createStarterPlayer } from "@/services/playerService";

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database connection timed out. Try again in a moment.")), ms);
    })
  ]);
}

export async function POST(request) {
  try {
    const body = registerSchema.parse(await request.json());
    await withTimeout(connectDb(), 12000);

    const exists = await User.exists({
      $or: [{ email: body.email.toLowerCase() }, { username: body.username }]
    });
    if (exists) {
      return NextResponse.json({ error: "Username or email already exists." }, { status: 409 });
    }

    const hashRounds = process.env.NODE_ENV === "production" ? 12 : 10;
    const passwordHash = await bcrypt.hash(body.password, hashRounds);
    const user = await User.create({
      username: body.username,
      email: body.email.toLowerCase(),
      passwordHash
    });
    await createStarterPlayer(user._id);
    await setSessionCookie(await createSession(user._id.toString()));

    return NextResponse.json({ ok: true, redirectTo: "/character" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Registration failed." }, { status: 400 });
  }
}
