import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import User from "@/models/User";

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
    const body = loginSchema.parse(await request.json());
    await withTimeout(connectDb(), 12000);

    const user = await User.findOne({
      $or: [{ email: body.identifier.toLowerCase() }, { username: body.identifier }]
    });
    if (!user || user.suspended) {
      return NextResponse.json({ error: "Invalid login." }, { status: 401 });
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid login." }, { status: 401 });
    }

    await setSessionCookie(await createSession(user._id.toString()));
    return NextResponse.json({ ok: true, redirectTo: "/dashboard" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Login failed." }, { status: 400 });
  }
}
