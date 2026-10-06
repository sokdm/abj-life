"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { emotes, objectActivities, qualityDefaults, walkableLayouts } from "@/lib/phase4Data";
import { findPath, isoToScreen } from "@/lib/pathfinding";
import { timePhases } from "@/lib/time";
import { AudioManager } from "@/lib/audioManager";

const audio = new AudioManager();

function tileStyle(point, origin) {
  const screen = isoToScreen(point);
  return {
    left: `${origin.x + screen.left}px`,
    top: `${origin.y + screen.top}px`
  };
}

function Character({ actor, origin, me, onClick }) {
  const screen = isoToScreen(actor.position);
  const state = actor.walking ? "walking" : actor.emote ? actor.emote.toLowerCase() : "idle";
  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(actor);
      }}
      className="absolute z-20 -translate-x-1/2 -translate-y-full text-center transition-[left,top] duration-300 ease-linear"
      style={{ left: `${origin.x + screen.left}px`, top: `${origin.y + screen.top + 22}px` }}
    >
      <div className={`mb-1 rounded bg-black/45 px-2 py-1 text-[10px] font-bold text-white/80 ${me ? "ring-1 ring-abj-green" : ""}`}>
        @{actor.username}<span className="block text-[9px] text-white/45">L{actor.level || 1}</span>
      </div>
      <div className={`mx-auto h-12 w-8 rounded-t-full border border-white/20 bg-abj-green/80 shadow-lg ${state === "walking" ? "animate-pulse" : ""}`}>
        <div className="mx-auto mt-1 h-4 w-4 rounded-full bg-amber-800" />
        <div className="mx-auto mt-1 h-4 w-5 rounded bg-abj-gold/80" />
      </div>
      {actor.emote && <div className="mt-1 rounded bg-abj-gold px-2 py-1 text-[10px] font-black text-abj-night">{actor.emote}</div>}
    </button>
  );
}

export function GameWorld({ player, username, socket, phase4State, roomPlayers, onOpenPhone, onSelectPlayer }) {
  const locationId = player.currentLocation || "starter-apartment";
  const layout = walkableLayouts[locationId] || walkableLayouts["starter-apartment"];
  const [position, setPosition] = useState(phase4State?.worldState?.position || layout.spawn);
  const [path, setPath] = useState([]);
  const [remoteActors, setRemoteActors] = useState({});
  const [selectedObject, setSelectedObject] = useState(null);
  const [activity, setActivity] = useState(null);
  const [settings, setSettings] = useState(qualityDefaults);
  const [audioSettings, setAudioSettings] = useState(audio.load());
  const [unlocked, setUnlocked] = useState(false);
  const origin = useMemo(() => ({ x: 440, y: 58 }), []);
  const phase = phase4State?.serverTime?.phase || "morning";
  const phaseStyle = timePhases[phase] || timePhases.morning;
  const stepTimer = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("abj_game_settings") || "{}");
    setSettings({ ...qualityDefaults, ...saved });
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("player:moved", (move) => {
      setRemoteActors((prev) => ({
        ...prev,
        [move.userId]: {
          ...(prev[move.userId] || {}),
          userId: move.userId,
          username: move.username,
          position: move.destination,
          walking: true,
          level: 1
        }
      }));
      setTimeout(() => {
        setRemoteActors((prev) => prev[move.userId] ? { ...prev, [move.userId]: { ...prev[move.userId], walking: false } } : prev);
      }, 900);
    });
    socket.on("player:emote", (event) => {
      setRemoteActors((prev) => ({
        ...prev,
        [event.userId]: {
          ...(prev[event.userId] || {}),
          userId: event.userId,
          username: event.username,
          position: prev[event.userId]?.position || layout.spawn,
          emote: event.emote
        }
      }));
      setTimeout(() => {
        setRemoteActors((prev) => prev[event.userId] ? { ...prev, [event.userId]: { ...prev[event.userId], emote: "" } } : prev);
      }, 2200);
    });
    return () => {
      socket.off("player:moved");
      socket.off("player:emote");
    };
  }, [socket, layout.spawn]);

  useEffect(() => {
    if (!path.length) return;
    clearInterval(stepTimer.current);
    stepTimer.current = setInterval(() => {
      setPath((current) => {
        const [, next, ...rest] = current;
        if (!next) {
          clearInterval(stepTimer.current);
          return [];
        }
        setPosition(next);
        audio.beep("sfx");
        return [next, ...rest];
      });
    }, settings.reduceAnimations ? 260 : 170);
    return () => clearInterval(stepTimer.current);
  }, [path.length, settings.reduceAnimations]);

  async function unlockAudio() {
    if (unlocked) return;
    await audio.unlock();
    setUnlocked(true);
  }

  function walkTo(point) {
    unlockAudio();
    const nextPath = findPath(layout, position, point);
    if (nextPath.length < 2) return;
    setPath(nextPath);
    socket?.emit("player:move", {
      locationId,
      start: position,
      destination: nextPath[nextPath.length - 1],
      path: nextPath,
      timestamp: Date.now()
    });
  }

  function emitEmote(emote) {
    unlockAudio();
    audio.beep("success");
    socket?.emit("player:emote", { locationId, emote });
  }

  function updateAudio(next) {
    setAudioSettings(audio.save(next));
  }

  async function startActivity(item) {
    const response = await fetch("/api/activities/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityId: item.action, sourceId: selectedObject.id, duration: item.duration })
    });
    const data = await response.json();
    if (response.ok) {
      setActivity({ ...item, remaining: item.duration });
      audio.beep("success");
    } else {
      setActivity({ action: data.error || "Unable to start", duration: 0, remaining: 0, effects: "" });
      audio.beep("error");
    }
  }

  useEffect(() => {
    if (!activity?.remaining) return;
    const timer = setInterval(() => {
      setActivity((current) => current ? { ...current, remaining: Math.max(0, current.remaining - 1) } : current);
    }, 1000);
    return () => clearInterval(timer);
  }, [activity?.remaining]);

  const remoteList = [
    ...roomPlayers.map((item, index) => ({
      userId: item.userId,
      username: item.username,
      status: item.status,
      position: { x: layout.spawn.x + (index % 3) + 1, y: layout.spawn.y - 1 },
      level: 1
    })),
    ...Object.values(remoteActors)
  ].filter((item, index, all) => all.findIndex((other) => other.userId === item.userId) === index && item.userId !== String(player.user));

  return (
    <div className="game-card relative overflow-hidden rounded-lg">
      <div className="absolute inset-0 transition-colors duration-700" style={{ background: `linear-gradient(${phaseStyle.sky}, #111827)` }} />
      <div className="absolute inset-0 transition-colors duration-700" style={{ background: phaseStyle.tint }} />
      <div className="relative min-h-[520px] overflow-hidden" onClick={unlockAudio}>
        <div className="absolute left-1/2 top-10 h-[430px] w-[760px] -translate-x-1/2">
          {Array.from({ length: layout.height }).map((_, y) =>
            Array.from({ length: layout.width }).map((__, x) => {
              const blocked = layout.blocked.some(([bx, by]) => bx === x && by === y);
              return (
                <button
                  key={`${x}-${y}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    walkTo({ x, y });
                  }}
                  className={`absolute h-9 w-[72px] -translate-x-1/2 rotate-45 border transition ${blocked ? "border-red-400/10 bg-black/20" : "border-white/10 bg-white/[0.035] hover:bg-abj-green/20"}`}
                  style={tileStyle({ x, y }, origin)}
                  aria-label={`Walk to ${x},${y}`}
                />
              );
            })
          )}

          {layout.objects.map((object) => {
            const screen = isoToScreen({ x: object.x, y: object.y });
            return (
              <button
                key={object.id}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedObject(object);
                  walkTo({ x: Math.max(0, object.x - 1), y: object.y });
                }}
                className="absolute z-10 -translate-x-1/2 -translate-y-full rounded border border-white/10 bg-black/45 px-3 py-2 text-xs font-black text-white/80 shadow-xl"
                style={{ left: `${origin.x + screen.left}px`, top: `${origin.y + screen.top + 22}px` }}
              >
                {object.label}
              </button>
            );
          })}

          {layout.npcs.map((npc) => <Character key={npc.id} actor={{ ...npc, username: npc.name, position: { x: npc.x, y: npc.y }, level: "NPC" }} origin={origin} />)}
          {remoteList.map((actor) => <Character key={actor.userId} actor={actor} origin={origin} onClick={onSelectPlayer} />)}
          <Character actor={{ username, position, level: player.level, walking: path.length > 1 }} origin={origin} me />
        </div>

        <div className="absolute left-4 top-4 rounded bg-black/40 px-3 py-2 text-sm">
          <p className="font-black">{layout.name}</p>
          <p className="text-white/55">{phase4State?.serverTime?.display} · {phaseStyle.label} · CLEAR</p>
        </div>

        <div className="absolute bottom-4 left-4 right-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap gap-2">
            {emotes.map((emote) => <button key={emote} onClick={() => emitEmote(emote)} className="rounded border border-white/10 bg-black/35 px-3 py-2 text-xs font-black">{emote}</button>)}
            <button onClick={onOpenPhone} className="rounded bg-abj-green px-3 py-2 text-xs font-black text-abj-night">ABJ ONE</button>
          </div>
          <div className="rounded border border-white/10 bg-black/40 p-3 text-xs">
            <div className="mb-2 flex items-center justify-between gap-3"><span>Audio</span><button onClick={() => updateAudio({ muted: !audioSettings.muted })} className="font-black text-abj-green">{audioSettings.muted ? "Unmute" : "Mute"}</button></div>
            <input type="range" min="0" max="1" step="0.05" value={audioSettings.master} onChange={(event) => updateAudio({ master: Number(event.target.value) })} />
          </div>
        </div>

        {selectedObject && (
          <div className="absolute bottom-4 left-4 right-4 z-30 rounded-[26px] border border-slate-200 bg-white/95 p-4 shadow-2xl md:left-auto md:top-4 md:bottom-auto md:w-72">
            <h3 className="font-black text-slate-900">{selectedObject.label}</h3>
            <div className="mt-3 grid gap-2">
              {(objectActivities[selectedObject.id] || selectedObject.actions.map((action) => ({ action, duration: 6, effects: "" }))).map((item) => (
                <button key={item.action} onClick={() => startActivity(item)} className="flex justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
                  <span>{item.action}</span>
                  <span className="text-emerald-600">{item.duration}s {item.effects}</span>
                </button>
              ))}
            </div>
            {activity && <p className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">{activity.action}: {activity.remaining}s</p>}
            <button onClick={() => setSelectedObject(null)} className="mt-3 text-xs font-bold text-slate-500">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
