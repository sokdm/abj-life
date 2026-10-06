"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const options = {
  gender: ["Male", "Female"],
  skinTone: ["Deep brown", "Brown", "Medium", "Light brown"],
  hairstyle: ["Low cut", "Fade", "Braids", "Afro", "Locs"],
  hairColor: ["Black", "Brown", "Gold tint", "Auburn"],
  clothing: ["Street casual", "Office smart", "Native fit", "Sport set"],
  shoes: ["Sneakers", "Loafers", "Slides", "Boots"]
};

export function CharacterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    gender: "Male",
    skinTone: "Deep brown",
    hairstyle: "Low cut",
    hairColor: "Black",
    clothing: "Street casual",
    shoes: "Sneakers"
  });

  async function submit(event) {
    event.preventDefault();
    const response = await fetch("/api/character", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to save character.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="game-card rounded-lg p-6">
        <h1 className="text-3xl font-black">Create your character</h1>
        <p className="mt-2 text-white/60">Choose a starter look. Cosmetics are structured for future expansion.</p>
        <label className="mt-6 block">
          <span className="mb-2 block text-sm text-white/70">Character name</span>
          <input className="w-full rounded border border-white/10 bg-black/25 px-4 py-3 outline-none focus:border-abj-green" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {Object.entries(options).map(([key, values]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-sm capitalize text-white/70">{key.replace(/([A-Z])/g, " $1")}</span>
              <select className="w-full rounded border border-white/10 bg-black/25 px-4 py-3 outline-none focus:border-abj-green" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                {values.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
          ))}
        </div>
        {error && <p className="mt-4 rounded bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>}
        <button className="mt-6 rounded bg-abj-green px-5 py-3 font-black text-abj-night">Save character</button>
      </div>
      <div className="game-card rounded-lg p-6">
        <div className="mx-auto grid aspect-[3/4] max-w-64 place-items-center rounded-lg bg-gradient-to-b from-abj-sky/20 to-abj-green/10">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 rounded-full border-4 border-white/20 bg-amber-800" />
            <div className="mx-auto mt-2 h-32 w-24 rounded-t-[40px] bg-abj-green/80" />
            <p className="mt-5 font-black">{form.name || "New Resident"}</p>
            <p className="text-sm text-white/55">{form.clothing} / {form.shoes}</p>
          </div>
        </div>
      </div>
    </form>
  );
}
