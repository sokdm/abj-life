"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, UserRound } from "lucide-react";

export function AuthForm({ mode }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [form, setForm] = useState({ username: "", email: "", identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const payload = isRegister
      ? { username: form.username, email: form.email, password: form.password }
      : { identifier: form.identifier, password: form.password };

    try {
      const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const data = await response.json();
      clearTimeout(timeout);
      setLoading(false);

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      router.push(data.redirectTo);
    } catch {
      clearTimeout(timeout);
      setLoading(false);
      setError("Connection is taking too long. Check MongoDB Atlas network access and try again.");
    }
  }

  return (
    <form onSubmit={submit} className="game-card mx-auto w-full max-w-md rounded-lg p-6">
      <h1 className="text-3xl font-black">{isRegister ? "Create account" : "Welcome back"}</h1>
      <p className="mt-2 text-sm text-white/60">
        {isRegister ? "Start as a new Abuja resident with N25,000." : "Continue building your Abuja story."}
      </p>

      <div className="mt-6 space-y-4">
        {isRegister && (
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-white/70"><UserRound size={16} /> Username</span>
            <input className="w-full rounded border border-white/10 bg-black/25 px-4 py-3 outline-none focus:border-abj-green" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </label>
        )}
        {isRegister ? (
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-white/70"><Mail size={16} /> Email</span>
            <input type="email" className="w-full rounded border border-white/10 bg-black/25 px-4 py-3 outline-none focus:border-abj-green" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
        ) : (
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-white/70"><UserRound size={16} /> Email or username</span>
            <input className="w-full rounded border border-white/10 bg-black/25 px-4 py-3 outline-none focus:border-abj-green" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} required />
          </label>
        )}
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm text-white/70"><Lock size={16} /> Password</span>
          <input type="password" className="w-full rounded border border-white/10 bg-black/25 px-4 py-3 outline-none focus:border-abj-green" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
      </div>

      {error && <p className="mt-4 rounded bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>}
      <button className="mt-6 w-full rounded bg-abj-green px-5 py-3 font-black text-abj-night transition hover:scale-[1.01]" disabled={loading}>
        {loading ? "Please wait..." : isRegister ? "Play Now" : "Enter Game"}
      </button>
    </form>
  );
}
