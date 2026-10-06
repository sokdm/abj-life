"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const options = {
  gender: ["Man", "Woman"],
  skinTone: ["Deep brown", "Rich brown", "Brown", "Medium brown", "Light brown"],
  hairstyle: ["Low Cut", "Bald", "Curls", "Afro", "Locs", "Braids", "Classic"],
  hairColor: ["Black", "Dark brown", "Brown", "Auburn", "Gold tint"],
  clothing: ["Casual", "Hoodie", "Office", "Chill", "Workwear", "Sportswear"],
  shoes: ["White Sneakers", "Black Sneakers", "Loafers", "Slides", "Boots"]
};

const skinColors = {
  "Deep brown": "#5b321d",
  "Rich brown": "#744323",
  Brown: "#8d5524",
  "Medium brown": "#b06f3c",
  "Light brown": "#d09a6a"
};

const hairColors = {
  Black: "#161616",
  "Dark brown": "#312015",
  Brown: "#5a3622",
  Auburn: "#8a3f25",
  "Gold tint": "#b9822e"
};

const outfitColors = {
  Casual: "#22c55e",
  Hoodie: "#2563eb",
  Office: "#0f172a",
  Chill: "#f59e0b",
  Workwear: "#64748b",
  Sportswear: "#ef4444"
};

function CharacterPreview({ form, rotation, setRotation }) {
  const skin = skinColors[form.skinTone] || skinColors.Brown;
  const hair = hairColors[form.hairColor] || hairColors.Black;
  const outfit = outfitColors[form.clothing] || outfitColors.Casual;
  const facing = rotation > 25 ? "↗" : rotation < -25 ? "↖" : "↓";

  return (
    <div className="game-card rounded-[28px] p-6">
      <div className="mx-auto grid aspect-[3/4] max-w-72 place-items-center rounded-[28px] bg-gradient-to-b from-sky-100 to-emerald-50 p-4">
        <div className="text-center" style={{ transform: `rotateY(${rotation}deg)` }}>
          <div className="relative mx-auto h-24 w-20">
            <div className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rounded-full border-4 border-white shadow" style={{ background: skin }} />
            {form.hairstyle !== "Bald" && <div className="absolute left-1/2 top-0 h-8 w-16 -translate-x-1/2 rounded-t-full" style={{ background: hair }} />}
            <div className="absolute left-[30px] top-8 h-1.5 w-1.5 rounded-full bg-black" />
            <div className="absolute right-[30px] top-8 h-1.5 w-1.5 rounded-full bg-black" />
          </div>
          <div className="relative mx-auto -mt-2 h-40 w-28">
            <div className="absolute left-1/2 top-0 h-24 w-20 -translate-x-1/2 rounded-t-[32px] shadow" style={{ background: outfit }} />
            <div className="absolute left-1 top-6 h-20 w-5 rounded-full" style={{ background: skin }} />
            <div className="absolute right-1 top-6 h-20 w-5 rounded-full" style={{ background: skin }} />
            <div className="absolute left-7 top-24 h-16 w-5 rounded-full bg-slate-700" />
            <div className="absolute right-7 top-24 h-16 w-5 rounded-full bg-slate-700" />
            <div className="absolute left-5 bottom-0 h-4 w-8 rounded-full bg-white shadow" />
            <div className="absolute right-5 bottom-0 h-4 w-8 rounded-full bg-white shadow" />
          </div>
          <p className="mt-4 font-black text-slate-900">{form.name || "New Resident"} {facing}</p>
          <p className="text-sm font-bold text-slate-500">{form.hairstyle} · {form.clothing}</p>
        </div>
      </div>
      <label className="mt-5 block">
        <span className="mb-2 block text-xs font-black uppercase text-slate-500">Rotate preview</span>
        <input type="range" min="-45" max="45" value={rotation} onChange={(event) => setRotation(Number(event.target.value))} className="w-full" />
      </label>
    </div>
  );
}

export function CharacterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [rotation, setRotation] = useState(0);
  const [form, setForm] = useState({
    name: "",
    gender: "Man",
    skinTone: "Deep brown",
    hairstyle: "Low Cut",
    hairColor: "Black",
    clothing: "Casual",
    shoes: "White Sneakers"
  });
  const isDirty = useMemo(() => Boolean(form.name.trim()), [form.name]);

  async function submit(event) {
    event.preventDefault();
    const payload = { ...form, gender: form.gender === "Man" ? "Male" : "Female" };
    const response = await fetch("/api/character", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
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
      <div className="game-card rounded-[28px] p-6">
        <h1 className="text-3xl font-black">Create your character</h1>
        <p className="mt-2 text-sm font-bold text-slate-500">Build a bright ABJ resident. Changes update the full-body preview instantly.</p>
        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-black text-slate-600">Character name</span>
          <input className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {Object.entries(options).map(([key, values]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-sm font-black capitalize text-slate-600">{key.replace(/([A-Z])/g, " $1")}</span>
              <select className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                {values.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-black text-slate-600">Top color</span>
            <input type="color" className="h-12 w-full rounded-full border border-slate-200 bg-white p-1" defaultValue="#22c55e" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-black text-slate-600">Bottom color</span>
            <input type="color" className="h-12 w-full rounded-full border border-slate-200 bg-white p-1" defaultValue="#334155" />
          </label>
        </div>
        {error && <p className="mt-4 rounded-2xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>}
        <button disabled={!isDirty} className="mt-6 rounded-full bg-emerald-500 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">SAVE CHANGES</button>
      </div>
      <CharacterPreview form={form} rotation={rotation} setRotation={setRotation} />
    </form>
  );
}
