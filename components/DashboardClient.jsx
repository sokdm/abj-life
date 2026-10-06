"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { Banknote, Bell, Clock, CloudSun, Home, Map, MessageCircle, Phone, Send, ShoppingBag, Users, Wallet, Wifi } from "lucide-react";
import { GameWorld } from "@/components/GameWorld";
import { districtCatalog, lockedPhoneApps, phoneApps } from "@/lib/worldData";
import { furnitureCatalog, furnitureCategories, homeTasks, mapFilters, mapLocations, needDefinitions, travelOptions } from "@/lib/phase4Data";

const naira = (value) => `N${Number(value || 0).toLocaleString()}`;

function needsFor(player) {
  return {
    hunger: Math.max(0, 100 - (player.hunger || 0)),
    energy: player.energy || 0,
    fun: Math.min(100, 50 + Math.round((player.happiness || 70) / 2)),
    social: player.happiness || 70,
    hygiene: Math.max(30, player.health || 70),
    comfort: player.house && player.house !== "Starter apartment option" ? 82 : 64
  };
}

function moodFor(needs) {
  const average = Object.values(needs).reduce((sum, value) => sum + value, 0) / Object.values(needs).length;
  if (needs.energy < 30) return "Tired";
  if (needs.hunger < 30) return "Hungry";
  if (average > 82) return "Very Happy";
  if (average > 68) return "Happy";
  if (average > 48) return "Okay";
  return "Stressed";
}

function NeedsPanel({ player }) {
  const needs = needsFor(player);
  return (
    <div className="grid gap-2 rounded-[24px] border border-slate-200 bg-white/95 p-3 shadow-lg">
      {needDefinitions.map((need) => (
        <div key={need.id} className="grid grid-cols-[78px_1fr_30px] items-center gap-2 text-[11px] font-bold text-slate-600">
          <span>{need.icon} {need.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-slate-100">
            <span className="block h-full rounded-full" style={{ width: `${needs[need.id]}%`, background: need.color }} />
          </span>
          <span className="text-right">{needs[need.id]}</span>
        </div>
      ))}
    </div>
  );
}

function TaskCards({ onPick, clean, setClean }) {
  if (clean) {
    return <button onClick={() => setClean(false)} className="soft-button rounded-full px-4 py-2 text-xs font-black">SHOW TASKS</button>;
  }
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {homeTasks.map((task) => (
        <button key={task.id} onClick={() => onPick(task.tab)} className="min-w-40 rounded-[20px] border border-slate-200 bg-white/95 p-3 text-left shadow-md">
          <span className="block text-sm font-black text-slate-900">{task.title}</span>
          <span className="text-xs font-bold text-emerald-600">{task.reward}</span>
        </button>
      ))}
      <button onClick={() => setClean(true)} className="min-w-28 rounded-[20px] border border-slate-200 bg-white/80 p-3 text-xs font-black text-slate-500">CLEAN SCREEN</button>
    </div>
  );
}

function ChatPanel({ socket, locationId, messages }) {
  const [text, setText] = useState("");
  function send() {
    if (!text.trim()) return;
    socket?.emit("chat:send", { locationId, message: text });
    setText("");
  }
  return (
    <div className="game-card rounded-[24px] p-4">
      <div className="mb-3 flex items-center gap-2"><MessageCircle size={18} className="text-emerald-600" /><h3 className="font-black">Local chat</h3></div>
      <div className="h-44 space-y-2 overflow-y-auto rounded-[18px] bg-slate-50 p-3 text-sm">
        {messages.length === 0 && <p className="text-slate-400">No messages in this room yet.</p>}
        {messages.map((msg) => <p key={msg.id} className="text-slate-700"><span className="font-bold text-emerald-600">{msg.username}:</span> {msg.message}</p>)}
      </div>
      <div className="mt-3 flex gap-2">
        <input className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 outline-none focus:border-emerald-500" value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something..." />
        <button onClick={send} className="rounded-full bg-emerald-500 px-3 text-white"><Send size={18} /></button>
      </div>
    </div>
  );
}

function BuyPanel({ player }) {
  const [category, setCategory] = useState("Comfort");
  const [selected, setSelected] = useState(null);
  const items = furnitureCatalog.filter((item) => item.category === category);
  return (
    <div className="space-y-4">
      <div className="game-card rounded-[28px] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">Buy Mode</h2>
            <p className="text-sm font-bold text-slate-500">Bank {naira(player.bankBalance)} · Cash {naira(player.cash)}</p>
          </div>
          <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white">FURNISH</span>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {furnitureCategories.map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-4 py-2 text-sm font-black ${category === item ? "bg-slate-900 text-white" : "soft-button"}`}>{item}</button>
          ))}
        </div>
      </div>
      <div className="bottom-sheet rounded-t-[28px] p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <button key={item.id} onClick={() => setSelected(item)} className={`rounded-[22px] border p-4 text-left shadow-sm ${selected?.id === item.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
              <div className="mb-3 grid aspect-[4/3] place-items-center rounded-[18px] bg-gradient-to-br from-sky-100 to-amber-100 text-3xl">▣</div>
              <h3 className="font-black text-slate-900">{item.name}</h3>
              <p className="text-xs font-bold text-slate-500">{item.footprint} · {item.rarity}</p>
              <p className="mt-2 font-black text-emerald-600">{naira(item.price)}</p>
            </button>
          ))}
        </div>
        {selected && (
          <div className="mt-4 rounded-[22px] border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-black text-slate-900">Placement preview: {selected.name}</p>
            <p className="text-sm text-slate-600">Move it around the room, rotate where supported, then purchase and place. Server validation is used for ownership and payment.</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-black text-white">PURCHASE & PLACE</button>
              <button onClick={() => setSelected(null)} className="soft-button rounded-full px-4 py-2 text-sm font-black">CANCEL</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MapPanel() {
  const [filter, setFilter] = useState("Food");
  const [selected, setSelected] = useState(mapLocations[0]);
  const visible = mapLocations.filter((location) => filter === "Moving" || filter === "Walk" || location.category === filter);
  return (
    <div className="game-card overflow-hidden rounded-[28px]">
      <div className="bg-gradient-to-br from-sky-200 via-emerald-100 to-amber-100 p-5">
        <h2 className="text-2xl font-black text-slate-900">Abuja Map</h2>
        <p className="text-sm font-bold text-slate-600">Tap a city icon to travel, work, eat, train, shop or socialize.</p>
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {mapFilters.map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs font-black ${filter === item ? "bg-slate-900 text-white" : "bg-white/85 text-slate-700"}`}>{item}</button>
          ))}
        </div>
        <div className="city-grid relative mt-5 min-h-[360px] rounded-[28px] border border-white/70 bg-white/45">
          {visible.map((location, index) => (
            <button key={location.id} onClick={() => setSelected(location)} className="absolute rounded-[20px] border border-white bg-white/95 px-3 py-2 text-left shadow-lg" style={{ left: `${10 + (index * 23) % 72}%`, top: `${18 + (index * 17) % 58}%` }}>
              <span className="block text-sm font-black text-slate-900">{location.name}</span>
              <span className="text-xs font-bold text-slate-500">{location.district}</span>
            </button>
          ))}
        </div>
      </div>
      {selected && (
        <div className="bottom-sheet p-5">
          <h3 className="text-xl font-black text-slate-900">{selected.name}</h3>
          <p className="text-sm font-bold text-slate-500">{selected.district} · {selected.category}</p>
          <p className="mt-2 text-sm text-slate-600">{selected.description}</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-black uppercase text-slate-500">Activities</p>
              <div className="flex flex-wrap gap-2">{selected.activities.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">{item}</span>)}</div>
            </div>
            <div>
              <p className="mb-2 text-xs font-black uppercase text-slate-500">Transport</p>
              <div className="grid gap-2">{travelOptions.filter((option) => selected.travel.includes(option.name)).map((option) => <button key={option.name} className="flex justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold"><span>{option.name}</span><span>{naira(option.price)} · {option.duration}</span></button>)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhonePanel({ player, setPlayer, notifications, transactions, economyState }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(1000);
  const [messageTo, setMessageTo] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [localEconomy, setLocalEconomy] = useState(economyState);

  async function refreshEconomy() {
    const response = await fetch("/api/economy");
    const data = await response.json();
    if (response.ok) setLocalEconomy(data);
  }

  async function transfer() {
    if (!confirm) {
      setConfirm({ recipient, amount: Number(amount), after: player.bankBalance - Number(amount) });
      return;
    }
    const response = await fetch("/api/bank/transfer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient, amount, idempotencyKey: crypto.randomUUID() }) });
    const data = await response.json();
    if (!response.ok) return setNotice(data.error);
    setPlayer(data.player);
    setConfirm(null);
    setNotice(`Transfer successful. ${naira(amount)} sent.`);
  }

  async function sendMessage() {
    const response = await fetch("/api/messages/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient: messageTo, body: message }) });
    const data = await response.json();
    setNotice(response.ok ? "Message sent." : data.error);
  }

  async function purchase(url, id, mode) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, mode, idempotencyKey: crypto.randomUUID() }) });
    const data = await response.json();
    if (!response.ok) return setNotice(data.error);
    setPlayer(data.player);
    setNotice("Purchase completed.");
    refreshEconomy();
  }

  return (
    <div className="game-card rounded-[32px] border-4 border-slate-900 bg-slate-900 p-3 shadow-xl">
      <div className="max-h-[78vh] overflow-y-auto rounded-[24px] bg-gradient-to-br from-sky-100 via-white to-emerald-50 p-4">
        <div className="flex items-center justify-between text-slate-900"><h2 className="text-xl font-black">ABJ ONE</h2><Wifi size={18} /></div>
        {notice && <p className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{notice}</p>}
        {confirm && (
          <div className="mt-3 rounded-[20px] border border-amber-200 bg-amber-50 p-3">
            <h3 className="font-black">Confirm transfer</h3>
            <p className="mt-2 text-sm text-slate-700">Recipient: @{confirm.recipient}</p>
            <p className="text-sm text-slate-700">Amount: {naira(confirm.amount)}</p>
            <p className="text-sm text-slate-700">Current bank: {naira(player.bankBalance)}</p>
            <p className="text-sm text-slate-700">After transfer: {naira(confirm.after)}</p>
            <div className="mt-3 flex gap-2"><button onClick={transfer} className="rounded-full bg-emerald-500 px-3 py-2 font-black text-white">CONFIRM</button><button onClick={() => setConfirm(null)} className="soft-button rounded-full px-3 py-2 font-black">CANCEL</button></div>
          </div>
        )}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {phoneApps.map((app) => <button key={app} className="aspect-square rounded-[18px] border border-slate-200 bg-white p-2 text-[10px] font-black text-slate-700 shadow-sm">{app}</button>)}
          {lockedPhoneApps.map((app) => <button key={app} className="aspect-square rounded-[18px] border border-slate-100 bg-slate-50 p-2 text-[10px] font-black text-slate-300">{app}</button>)}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <section className="rounded-[20px] border border-slate-200 bg-white p-3">
            <h3 className="font-black">ABJ Bank</h3>
            <p className="text-sm text-slate-500">Acct {player.accountNumber} · Bank {naira(player.bankBalance)}</p>
            <input className="mt-3 w-full rounded-full border border-slate-200 px-3 py-2" placeholder="Username or account number" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <input type="number" className="mt-2 w-full rounded-full border border-slate-200 px-3 py-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <button onClick={transfer} className="mt-2 rounded-full bg-emerald-500 px-3 py-2 font-black text-white">Send money</button>
          </section>
          <section className="rounded-[20px] border border-slate-200 bg-white p-3">
            <h3 className="font-black">Messages</h3>
            <input className="mt-3 w-full rounded-full border border-slate-200 px-3 py-2" placeholder="Recipient username" value={messageTo} onChange={(e) => setMessageTo(e.target.value)} />
            <input className="mt-2 w-full rounded-full border border-slate-200 px-3 py-2" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={sendMessage} className="mt-2 rounded-full bg-slate-900 px-3 py-2 font-black text-white">Send</button>
          </section>
        </div>
        <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-3">
          <h3 className="font-black">Houses, Cars & Inventory</h3>
          <p className="text-sm text-slate-500">Properties {localEconomy.properties?.length || 0} · Vehicles {localEconomy.vehicles?.length || 0} · Items {localEconomy.inventory?.length || 0}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {localEconomy.catalog.properties.slice(0, 3).map((property) => <button key={property.id} onClick={() => purchase("/api/properties/purchase", property.id, "BUY")} className="rounded-2xl border border-slate-200 p-3 text-left text-xs font-bold">{property.name}<span className="block text-emerald-600">{naira(property.price)}</span></button>)}
            {localEconomy.catalog.vehicles.slice(0, 2).map((vehicle) => <button key={vehicle.id} onClick={() => purchase("/api/vehicles/purchase", vehicle.id)} className="rounded-2xl border border-slate-200 p-3 text-left text-xs font-bold">{vehicle.model}<span className="block text-emerald-600">{naira(vehicle.price)}</span></button>)}
          </div>
        </div>
        <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-3">
          <h3 className="font-black">Notifications</h3>
          <div className="mt-2 grid gap-1 text-sm text-slate-600">{notifications.slice(0, 5).map((item) => <p key={item._id}>{item.title}</p>)}</div>
          <h3 className="mt-4 font-black">Recent transactions</h3>
          <div className="mt-2 grid gap-1 text-sm text-slate-600">{transactions.slice(0, 5).map((item) => <p key={item._id}>{item.type}: {naira(item.amount)}</p>)}</div>
        </div>
      </div>
    </div>
  );
}

export function DashboardClient({ initialPlayer, username, initialNotifications = [], initialTransactions = [], economyState, phase4State }) {
  const [player, setPlayer] = useState(initialPlayer);
  const [tab, setTab] = useState("HOME");
  const [cleanScreen, setCleanScreen] = useState(false);
  const [clock, setClock] = useState({ time: phase4State?.serverTime?.display || "Nigeria time", day: "Africa/Lagos", phase: phase4State?.serverTime?.phase || "morning" });
  const [socket, setSocket] = useState(null);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const currentDistrict = useMemo(() => districtCatalog.find((item) => item.id === player.currentDistrict), [player.currentDistrict]);
  const needs = needsFor(player);
  const mood = moodFor(needs);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const response = await fetch("/api/phase4/time");
        const data = await response.json();
        if (data.ok) setClock({ time: data.serverTime.display, day: data.serverTime.timezone, phase: data.serverTime.phase });
      } catch {
        setClock((current) => current);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const client = io({ path: "/api/socket", auth: { username, avatar: player.character?.name?.slice(0, 2) || "ABJ" } });
    setSocket(client);
    client.on("connect", () => client.emit("location:join", { locationId: player.currentLocation || "starter-apartment" }));
    client.on("presence:count", setOnlineCount);
    client.on("location:players", setRoomPlayers);
    client.on("chat:history", ({ messages: history }) => setMessages(history || []));
    client.on("chat:message", (msg) => setMessages((prev) => [...prev, msg].slice(-30)));
    client.on("direct:message", (msg) => setMessages((prev) => [...prev, { ...msg, id: `${Date.now()}-direct`, username: msg.username || "DM" }].slice(-30)));
    return () => client.disconnect();
  }, [username, player.character?.name, player.currentLocation]);

  const nav = [["HOME", Home], ["BUY", ShoppingBag], ["MAP", Map], ["PHONE", Phone]];

  return (
    <div className={`space-y-4 pb-24 xl:pb-0 ${clock.phase === "night" ? "brightness-95" : ""}`}>
      <header className="glass-panel sticky top-3 z-20 rounded-[28px] p-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 font-black text-slate-800 shadow-sm"><Clock size={16} /> {clock.time}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 font-bold text-slate-600"><CloudSun size={16} /> {clock.phase}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 font-black text-emerald-600"><Banknote size={16} /> {naira(player.cash)}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 font-black text-sky-700"><Wallet size={16} /> {naira(player.bankBalance)}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 font-bold text-slate-600"><Bell size={16} /> {initialNotifications.filter((item) => !item.read).length}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 font-black text-white">{mood}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-400 font-black text-slate-900 shadow-md">{player.character?.name?.slice(0, 2) || "AB"}</div>
            <div><p className="font-black text-slate-900">{player.character?.name || username}</p><p className="text-xs font-bold text-slate-500">Level {player.level} · {currentDistrict?.name} · Net {naira(economyState.netWorth)}</p></div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-white px-3 py-2 text-slate-600">Visits {Math.max(1, player.level * 3)}</span>
          <span className="rounded-full bg-white px-3 py-2 text-slate-600"><Users size={13} className="inline" /> {onlineCount} online</span>
          <span className="rounded-full bg-white px-3 py-2 text-slate-600">{clock.day}</span>
        </div>
      </header>

      <main className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {tab === "HOME" && <>
            <TaskCards onPick={setTab} clean={cleanScreen} setClean={setCleanScreen} />
            <GameWorld player={player} username={username} socket={socket} phase4State={phase4State} roomPlayers={roomPlayers.filter((item) => item.userId !== String(player.user))} onOpenPhone={() => setTab("PHONE")} onSelectPlayer={setSelectedPlayer} />
          </>}
          {tab === "BUY" && <BuyPanel player={player} />}
          {tab === "MAP" && <MapPanel />}
          {tab === "PHONE" && <PhonePanel player={player} setPlayer={setPlayer} notifications={initialNotifications} transactions={initialTransactions} economyState={economyState} />}
        </div>
        <div className="space-y-4">
          <NeedsPanel player={player} />
          <ChatPanel socket={socket} locationId={player.currentLocation || "starter-apartment"} messages={messages} />
          <div className="game-card rounded-[24px] p-4">
            <h3 className="font-black">Current location</h3>
            <p className="mt-2 text-slate-600">{player.currentLocation || "starter-apartment"} · {currentDistrict?.name}</p>
            <p className="mt-3 text-sm text-slate-500">Presence is public only inside your current room.</p>
          </div>
        </div>
      </main>

      {selectedPlayer && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 p-4" onClick={() => setSelectedPlayer(null)}>
          <div className="game-card w-full max-w-sm rounded-[24px] p-5" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-xl font-black">{selectedPlayer.username}</h3>
            <p className="text-sm text-slate-500">{selectedPlayer.status}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {["View Profile", "Add Friend", "Message", "Send Money", "Invite", "Wave", "Block", "Report"].map((action) => <button key={action} className="soft-button rounded-full px-3 py-2 text-sm font-bold">{action}</button>)}
            </div>
          </div>
        </div>
      )}

      <nav className="glass-panel fixed bottom-3 left-3 right-3 z-30 grid grid-cols-4 gap-2 rounded-[28px] p-2 xl:left-auto xl:right-6 xl:top-36 xl:bottom-auto xl:w-64 xl:grid-cols-1">
        {nav.map(([item, Icon]) => <button key={item} onClick={() => setTab(item)} className={`flex items-center justify-center gap-2 rounded-[20px] px-3 py-3 text-xs font-black ${tab === item ? "bg-slate-900 text-white" : "bg-white text-slate-800 shadow-sm"}`}><Icon size={18} /> {item}</button>)}
      </nav>
    </div>
  );
}
