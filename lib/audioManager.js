"use client";

import { audioDefaults } from "@/lib/phase4Data";

export class AudioManager {
  constructor() {
    this.settings = audioDefaults;
    this.ready = false;
    this.context = null;
  }

  load() {
    try {
      const stored = JSON.parse(localStorage.getItem("abj_audio") || "{}");
      this.settings = { ...audioDefaults, ...stored };
    } catch {
      this.settings = audioDefaults;
    }
    return this.settings;
  }

  save(next) {
    this.settings = { ...this.settings, ...next };
    localStorage.setItem("abj_audio", JSON.stringify(this.settings));
    return this.settings;
  }

  async unlock() {
    if (this.ready || typeof window === "undefined") return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    await this.context.resume();
    this.ready = true;
  }

  beep(type = "sfx") {
    if (!this.ready || this.settings.muted || !this.context) return;
    const gain = this.context.createGain();
    const osc = this.context.createOscillator();
    const volume = this.settings.master * (this.settings[type] ?? this.settings.sfx);
    osc.frequency.value = type === "error" ? 160 : type === "success" ? 520 : 320;
    gain.gain.value = Math.max(0, Math.min(0.12, volume * 0.12));
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start();
    osc.stop(this.context.currentTime + 0.08);
  }
}
