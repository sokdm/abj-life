"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { Banknote, Bell, BriefcaseBusiness, Clock, CloudSun, Home, Map, MessageCircle, Phone, Send, Users, Wallet, Wifi } from "lucide-react";
import { districtCatalog, jobCatalog, lockedPhoneApps, phoneApps } from "@/lib/worldData";
import { GameWorld } from "@/components/GameWorld";

const naira = (value) => `N${Number(value || 0).toLocaleString()}`;

function getClock() {
  const minutes = Math.floor((Date.now() / 1000) % 1440);
  const hour = Math.floor(minutes / 60);
  const phase = hour < 6 ? "Night" : hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  return { phase, day: `Day ${Math.floor(Date.now() / 86400000) % 31 + 1}`, time: `${String(hour).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}` };
}

function Meter({ label, value, color }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-white/60"><span>{label}</span><span>{value}%</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
    </div>
  );
}

function ApartmentScene({ player, roomPlayers, onPhone, onPlayer }) {
  const objects = [
    ["Bed", "left-[9%] top-[18%] h-[25%] w-[28%] bg-abj-sky/25"],
    ["Wardrobe", "right-[7%] top-[12%] h-[34%] w-[18%] bg-abj-gold/25"],
    ["Couch", "left-[14%] bottom-[15%] h-[18%] w-[34%] bg-abj-green/20"],
    ["Table", "left-[48%] top-[52%] h-[14%] w-[20%] bg-white/10"],
    ["Door", "right-[10%] bottom-[10%] h-[32%] w-[16%] bg-abj-coral/25"],
    ["Phone", "left-[55%] bottom-[24%] h-[10%] w-[10%] bg-abj-green/40"]
  ];
  return (
    <div className="game-card relative min-h-[430px] overflow-hidden rounded-lg p-4">
      <div className="city-grid absolute inset-0 opacity-30" />
      <div className="absolute left-1/2 top-[52%] h-[320px] w-[520px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-lg border border-white/10 bg-black/20 shadow-2xl" />
      {objects.map(([name, classes]) => (
        <button key={name} onClick={name === "Phone" ? onPhone : undefined} className={`absolute ${classes} -skew-y-6 rounded-lg border border-white/10 p-2 text-xs font-black text-white/75 transition hover:scale-105 hover:border-abj-green`}>
          {name}
        </button>
      ))}
      <div className="absolute left-[43%] top-[45%] grid h-20 w-14 place-items-center rounded-full border border-abj-green/40 bg-abj-green/20 shadow-glow">
        <span className="text-xs font-black">{player.character?.name?.slice(0, 2) || "ABJ"}</span>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
        {roomPlayers.map((item) => (
          <button key={item.userId} onClick={() => onPlayer(item)} className="rounded border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-white/70">{item.username} · {item.status}</button>
        ))}
      </div>
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
    <div className="game-card rounded-lg p-4">
      <div className="mb-3 flex items-center gap-2"><MessageCircle size={18} className="text-abj-green" /><h3 className="font-black">Local chat</h3></div>
      <div className="h-44 space-y-2 overflow-y-auto rounded bg-black/25 p-3 text-sm">
        {messages.length === 0 && <p className="text-white/40">No messages in this room yet.</p>}
        {messages.map((msg) => <p key={msg.id} className="text-white/75"><span className="font-bold text-abj-green">{msg.username}:</span> {msg.message}</p>)}
      </div>
      <div className="mt-3 flex gap-2">
        <input className="min-w-0 flex-1 rounded border border-white/10 bg-black/25 px-3 py-2 outline-none focus:border-abj-green" value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something..." />
        <button onClick={send} className="rounded bg-abj-green px-3 text-abj-night"><Send size={18} /></button>
      </div>
    </div>
  );
}

function CityPanel({ player, setPlayer }) {
  const [notice, setNotice] = useState("");
  async function travel(districtId) {
    const response = await fetch("/api/world/travel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ districtId }) });
    const data = await response.json();
    if (!response.ok) return setNotice(data.error);
    setPlayer(data.player);
    setNotice("Travel complete.");
  }
  return (
    <div className="game-card rounded-lg p-4">
      <h2 className="text-xl font-black">Abuja city map</h2>
      {notice && <p className="mt-3 rounded bg-white/5 px-3 py-2 text-sm text-white/70">{notice}</p>}
      <div className="city-grid mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {districtCatalog.map((district) => {
          const locked = player.level < district.level || player.cash + player.bankBalance < district.wealth || player.civilianReputation < district.reputation;
          return (
            <div key={district.id} className={`rounded-lg border p-4 ${locked ? "border-white/10 bg-black/35 text-white/45" : "border-abj-green/30 bg-abj-green/10"}`}>
              <div className="flex justify-between gap-3"><h3 className="font-black">{district.name}</h3><span className="text-xs">{district.tier}</span></div>
              <p className="mt-2 min-h-12 text-sm">{district.description}</p>
              <p className="mt-2 text-xs">Cost {naira(district.travelCost)} · {district.travelMinutes} mins · L{district.level}</p>
              <button disabled={locked || player.currentDistrict === district.id} onClick={() => travel(district.id)} className="mt-3 w-full rounded border border-white/15 px-3 py-2 text-sm font-black disabled:opacity-40">{player.currentDistrict === district.id ? "Current" : locked ? "Locked" : "Travel"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivitiesPanel({ setPlayer }) {
  const [notice, setNotice] = useState("");
  async function work(jobId) {
    const score = Math.floor(55 + Math.random() * 45);
    const response = await fetch("/api/jobs/task", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId, score }) });
    const data = await response.json();
    if (!response.ok) return setNotice(data.error);
    setPlayer(data.player);
    setNotice(`Task score ${score}. Reward calculated server-side.`);
  }
  return (
    <div className="game-card rounded-lg p-4">
      <h2 className="text-xl font-black">Activities</h2>
      {notice && <p className="mt-3 rounded bg-white/5 px-3 py-2 text-sm text-white/70">{notice}</p>}
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {jobCatalog.map((job) => (
          <div key={job.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="flex justify-between gap-3"><h3 className="font-black">{job.name}</h3><span className="text-abj-green">{naira(job.salary)}</span></div>
            <p className="text-sm text-white/55">{job.company} · {job.duration} min · {job.xp} XP</p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/45">{job.task.replaceAll("_", " ")}</p>
            <button onClick={() => work(job.id)} className="mt-3 rounded bg-abj-gold px-4 py-2 font-black text-abj-night">Start task</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhonePanel({ player, setPlayer, notifications, transactions, economyState }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(1000);
  const [messageTo, setMessageTo] = useState("");
  const [message, setMessage] = useState("");
  const [friend, setFriend] = useState("");
  const [socialPost, setSocialPost] = useState("");
  const [crewName, setCrewName] = useState("");
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
    setNotice(`Transfer Successful. ${naira(amount)} sent.`);
  }
  async function purchase(url, id, mode) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, mode, idempotencyKey: crypto.randomUUID() }) });
    const data = await response.json();
    if (!response.ok) return setNotice(data.error);
    setPlayer(data.player);
    setNotice("Purchase completed.");
    refreshEconomy();
  }
  async function sendMessage() {
    const response = await fetch("/api/messages/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient: messageTo, body: message }) });
    const data = await response.json();
    setNotice(response.ok ? "Message sent." : data.error);
  }
  async function addFriend() {
    const response = await fetch("/api/friends/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: friend }) });
    const data = await response.json();
    setNotice(response.ok ? "Friend request sent." : data.error);
  }
  async function postSocial() {
    const response = await fetch("/api/social/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: socialPost }) });
    const data = await response.json();
    setNotice(response.ok ? "Posted to ABJ Social." : data.error);
    if (response.ok) setSocialPost("");
  }
  async function createCrew() {
    const response = await fetch("/api/crews/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: crewName }) });
    const data = await response.json();
    setNotice(response.ok ? "Crew created." : data.error);
    if (response.ok) setCrewName("");
  }
  return (
    <div className="game-card rounded-[28px] border-4 border-black bg-black p-4 shadow-glow">
      <div className="rounded-[22px] border border-white/10 bg-gradient-to-br from-abj-panel to-black p-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-black">ABJ ONE</h2><Wifi size={18} className="text-abj-green" /></div>
        {notice && <p className="mt-3 rounded bg-white/5 px-3 py-2 text-sm text-white/70">{notice}</p>}
        {confirm && (
          <div className="mt-3 rounded-lg border border-abj-gold/40 bg-abj-gold/10 p-3">
            <h3 className="font-black">Confirm transfer</h3>
            <p className="mt-2 text-sm text-white/70">Recipient: @{confirm.recipient}</p>
            <p className="text-sm text-white/70">Amount: {naira(confirm.amount)}</p>
            <p className="text-sm text-white/70">Current bank: {naira(player.bankBalance)}</p>
            <p className="text-sm text-white/70">After transfer: {naira(confirm.after)}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={transfer} className="rounded bg-abj-green px-3 py-2 font-black text-abj-night">CONFIRM TRANSFER</button>
              <button onClick={() => setConfirm(null)} className="rounded border border-white/15 px-3 py-2 font-black">CANCEL</button>
            </div>
          </div>
        )}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {phoneApps.map((app) => <button key={app} className="aspect-square rounded-lg border border-white/10 bg-white/[0.05] p-2 text-[11px] font-bold">{app}</button>)}
          {lockedPhoneApps.map((app) => <button key={app} className="aspect-square rounded-lg border border-white/5 bg-black/30 p-2 text-[10px] text-white/35">{app}</button>)}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-white/10 bg-black/25 p-3">
            <h3 className="font-black">ABJ Bank</h3>
            <p className="text-sm text-white/55">Acct {player.accountNumber} · Bank {naira(player.bankBalance)}</p>
            <input className="mt-3 w-full rounded bg-black/35 px-3 py-2" placeholder="Username or account number" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <input type="number" className="mt-2 w-full rounded bg-black/35 px-3 py-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <button onClick={transfer} className="mt-2 rounded bg-abj-green px-3 py-2 font-black text-abj-night">Transfer</button>
          </section>
          <section className="rounded-lg border border-white/10 bg-black/25 p-3">
            <h3 className="font-black">Messages</h3>
            <input className="mt-3 w-full rounded bg-black/35 px-3 py-2" placeholder="Recipient username" value={messageTo} onChange={(e) => setMessageTo(e.target.value)} />
            <input className="mt-2 w-full rounded bg-black/35 px-3 py-2" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={sendMessage} className="mt-2 rounded border border-abj-green/40 px-3 py-2 font-black text-abj-green">Send</button>
          </section>
          <section className="rounded-lg border border-white/10 bg-black/25 p-3">
            <h3 className="font-black">Contacts</h3>
            <input className="mt-3 w-full rounded bg-black/35 px-3 py-2" placeholder="Username" value={friend} onChange={(e) => setFriend(e.target.value)} />
            <button onClick={addFriend} className="mt-2 rounded border border-white/15 px-3 py-2 font-black">Add friend</button>
          </section>
          <section className="rounded-lg border border-white/10 bg-black/25 p-3">
            <h3 className="font-black">Notifications</h3>
            <div className="mt-2 max-h-32 space-y-2 overflow-y-auto text-sm text-white/60">{notifications.slice(0, 5).map((item) => <p key={item._id}>{item.title}</p>)}</div>
          </section>
        </div>
        <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-3">
          <h3 className="font-black">Recent transactions</h3>
          <div className="mt-2 grid gap-1 text-sm text-white/60">{transactions.slice(0, 5).map((item) => <p key={item._id}>{item.type}: {naira(item.amount)}</p>)}</div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <section className="rounded-lg border border-white/10 bg-black/25 p-3">
            <h3 className="font-black">Properties</h3>
            <p className="text-sm text-white/55">Owned/rented: {localEconomy.properties?.length || 0}</p>
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
              {localEconomy.catalog.properties.map((property) => (
                <div key={property.id} className="rounded border border-white/10 p-3">
                  <p className="font-bold">{property.name}</p>
                  <p className="text-xs text-white/50">{property.type} · {property.district} · L{property.level}</p>
                  <p className="text-xs text-white/60">Buy {naira(property.price)} · Rent {naira(property.rentPrice)}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => purchase("/api/properties/purchase", property.id, "BUY")} className="rounded bg-abj-green px-2 py-1 text-xs font-black text-abj-night">Buy</button>
                    <button onClick={() => purchase("/api/properties/purchase", property.id, "RENT")} className="rounded border border-white/15 px-2 py-1 text-xs font-black">Rent</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-white/10 bg-black/25 p-3">
            <h3 className="font-black">Garage</h3>
            <p className="text-sm text-white/55">Owned: {localEconomy.vehicles?.length || 0}</p>
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
              {localEconomy.catalog.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="rounded border border-white/10 p-3">
                  <p className="font-bold">{vehicle.brand} {vehicle.model}</p>
                  <p className="text-xs text-white/50">{vehicle.category} · Speed {vehicle.speed} · Comfort {vehicle.comfort}</p>
                  <p className="text-xs text-white/60">{naira(vehicle.price)}</p>
                  <button onClick={() => purchase("/api/vehicles/purchase", vehicle.id)} className="mt-2 rounded bg-abj-gold px-2 py-1 text-xs font-black text-abj-night">Buy</button>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-white/10 bg-black/25 p-3">
            <h3 className="font-black">Shop & Inventory</h3>
            <p className="text-sm text-white/55">Items: {localEconomy.inventory?.length || 0}</p>
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
              {localEconomy.catalog.items.map((item) => (
                <div key={item.id} className="rounded border border-white/10 p-3">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-white/50">{item.category} · {item.rarity}</p>
                  <p className="text-xs text-white/60">{naira(item.price)}</p>
                  <button onClick={() => purchase("/api/shop/purchase", item.id)} className="mt-2 rounded border border-abj-green/40 px-2 py-1 text-xs font-black text-abj-green">Buy</button>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-white/10 bg-black/25 p-3">
            <h3 className="font-black">ABJ Social</h3>
            <textarea className="mt-3 h-20 w-full resize-none rounded bg-black/35 px-3 py-2" placeholder="Share an in-game update..." value={socialPost} onChange={(e) => setSocialPost(e.target.value)} />
            <button onClick={postSocial} className="mt-2 rounded bg-abj-green px-3 py-2 font-black text-abj-night">Post</button>
          </section>
          <section className="rounded-lg border border-white/10 bg-black/25 p-3">
            <h3 className="font-black">Crews</h3>
            <input className="mt-3 w-full rounded bg-black/35 px-3 py-2" placeholder="Crew name" value={crewName} onChange={(e) => setCrewName(e.target.value)} />
            <button onClick={createCrew} className="mt-2 rounded border border-abj-gold/40 px-3 py-2 font-black text-abj-gold">Create crew</button>
          </section>
        </div>
      </div>
    </div>
  );
}

export function DashboardClient({ initialPlayer, username, initialNotifications = [], initialTransactions = [], economyState, phase4State }) {
  const [player, setPlayer] = useState(initialPlayer);
  const [tab, setTab] = useState("HOME");
  const [clock, setClock] = useState({
    time: phase4State?.serverTime?.display || "Nigeria time",
    day: "Africa/Lagos",
    phase: phase4State?.serverTime?.phase || "morning"
  });
  const [socket, setSocket] = useState(null);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const currentDistrict = useMemo(() => districtCatalog.find((item) => item.id === player.currentDistrict), [player.currentDistrict]);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const response = await fetch("/api/phase4/time");
        const data = await response.json();
        if (data.ok) {
          setClock({
            time: data.serverTime.display,
            day: data.serverTime.timezone,
            phase: data.serverTime.phase
          });
        }
      } catch {
        setClock((current) => current);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [phase4State?.serverTime?.display, phase4State?.serverTime?.phase]);

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

  const nav = [["HOME", Home], ["CITY", Map], ["ACTIVITIES", BriefcaseBusiness], ["PHONE", Phone]];

  return (
    <div className={`space-y-4 pb-24 xl:pb-0 ${clock.phase === "night" ? "brightness-90" : ""}`}>
      <header className="glass-panel sticky top-3 z-20 rounded-lg p-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded bg-black/25 px-3 py-2"><Clock size={16} /> {clock.time} · {clock.day}</span>
            <span className="inline-flex items-center gap-2 rounded bg-black/25 px-3 py-2"><CloudSun size={16} /> {clock.phase}</span>
            <span className="inline-flex items-center gap-2 rounded bg-black/25 px-3 py-2"><Banknote size={16} /> {naira(player.cash)}</span>
            <span className="inline-flex items-center gap-2 rounded bg-black/25 px-3 py-2"><Wallet size={16} /> {naira(player.bankBalance)}</span>
            <span className="inline-flex items-center gap-2 rounded bg-black/25 px-3 py-2"><Users size={16} /> {onlineCount} online</span>
            <span className="inline-flex items-center gap-2 rounded bg-black/25 px-3 py-2"><Bell size={16} /> {initialNotifications.filter((item) => !item.read).length}</span>
            <span className="inline-flex items-center gap-2 rounded bg-black/25 px-3 py-2">Net {naira(economyState.netWorth)}</span>
          </div>
          <div className="grid min-w-72 gap-2">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded bg-abj-green font-black text-abj-night">{player.character?.name?.slice(0, 2) || "AB"}</div>
              <div><p className="font-black">{player.character?.name || username}</p><p className="text-xs text-white/50">Level {player.level} · {currentDistrict?.name}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2"><Meter label="Health" value={player.health} color="bg-abj-green" /><Meter label="Energy" value={player.energy} color="bg-abj-sky" /><Meter label="Hunger" value={100 - player.hunger} color="bg-abj-gold" /><Meter label="Social" value={player.happiness || 70} color="bg-abj-coral" /></div>
          </div>
        </div>
      </header>

      <main className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {tab === "HOME" && <GameWorld player={player} username={username} socket={socket} phase4State={phase4State} roomPlayers={roomPlayers.filter((item) => item.userId !== String(player.user))} onOpenPhone={() => setTab("PHONE")} onSelectPlayer={setSelectedPlayer} />}
          {tab === "CITY" && <CityPanel player={player} setPlayer={setPlayer} />}
          {tab === "ACTIVITIES" && <ActivitiesPanel setPlayer={setPlayer} />}
          {tab === "PHONE" && <PhonePanel player={player} setPlayer={setPlayer} notifications={initialNotifications} transactions={initialTransactions} economyState={economyState} />}
        </div>
        <div className="space-y-4">
          <ChatPanel socket={socket} locationId={player.currentLocation || "starter-apartment"} messages={messages} />
          <div className="game-card rounded-lg p-4">
            <h3 className="font-black">Current location</h3>
            <p className="mt-2 text-white/65">{player.currentLocation || "starter-apartment"} · {currentDistrict?.name}</p>
            <p className="mt-3 text-sm text-white/45">Presence is public only inside your current room.</p>
          </div>
        </div>
      </main>

      {selectedPlayer && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4" onClick={() => setSelectedPlayer(null)}>
          <div className="game-card w-full max-w-sm rounded-lg p-5" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-xl font-black">{selectedPlayer.username}</h3>
            <p className="text-sm text-white/55">{selectedPlayer.status}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {["View Profile", "Add Friend", "Message", "Send Money", "Invite", "Block", "Report"].map((action) => <button key={action} className="rounded border border-white/10 px-3 py-2 text-sm font-bold">{action}</button>)}
            </div>
          </div>
        </div>
      )}

      <nav className="glass-panel fixed bottom-3 left-3 right-3 z-30 grid grid-cols-4 gap-2 rounded-lg p-2 xl:left-auto xl:right-6 xl:top-36 xl:bottom-auto xl:w-64 xl:grid-cols-1">
        {nav.map(([item, Icon]) => <button key={item} onClick={() => setTab(item)} className={`flex items-center justify-center gap-2 rounded px-3 py-3 text-xs font-black ${tab === item ? "bg-abj-green text-abj-night" : "bg-black/25 text-white/65"}`}><Icon size={18} /> {item}</button>)}
      </nav>
    </div>
  );
}
