"use client";

import { useEffect, useRef, useState } from "react";

type Track = { name: string; emoji: string; bpm: number; freq: number; type: OscillatorType };

const TRACKS: Track[] = [
  { name: "pagi tenang", emoji: "🌅", bpm: 60, freq: 261.63, type: "sine" },
  { name: "siang sibuk", emoji: "☀️", bpm: 120, freq: 329.63, type: "triangle" },
  { name: "sore malas", emoji: "🌇", bpm: 78, freq: 220, type: "sine" },
  { name: "malam khusuk", emoji: "🌙", bpm: 50, freq: 196, type: "sine" },
];

export function MoodPlayer() {
  const [active, setActive] = useState<string | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => () => stop(), []);

  const play = (t: Track) => {
    if (active === t.name) {
      stop();
      return;
    }
    stop();
    try {
      if (typeof window === "undefined") return;
      const W = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const Ctx = W.AudioContext || W.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      ctxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = t.type;
      osc.frequency.value = t.freq;
      gain.gain.value = 0.04;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
      setActive(t.name);
    } catch {
      // ignore
    }
  };

  const stop = () => {
    try {
      oscRef.current?.stop();
      oscRef.current?.disconnect();
      gainRef.current?.disconnect();
      ctxRef.current?.close();
    } catch {
      // ignore
    }
    oscRef.current = null;
    gainRef.current = null;
    ctxRef.current = null;
    setActive(null);
  };

  return (
    <div className="rounded-3xl border border-ink/20 bg-paper p-6">
      <p className="eyebrow mb-2">/ mood player</p>
      <p className="font-serif italic text-2xl mb-4">
        Pilih suasana, dengar drone tone yang cocok untuk ngopi.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TRACKS.map((t) => {
          const isActive = active === t.name;
          return (
            <button
              key={t.name}
              onClick={() => play(t)}
              className={
                "rounded-2xl border px-4 py-5 text-center transition " +
                (isActive
                  ? "bg-ink text-cream border-ink"
                  : "bg-cream border-ink/20 hover:border-ink")
              }
            >
              <div className="text-3xl mb-1">{t.emoji}</div>
              <p className="font-mono text-xs lowercase">{t.name}</p>
              <p className="text-[10px] opacity-60 font-mono mt-1">
                {isActive ? "berjalan" : `${t.bpm} bpm`}
              </p>
            </button>
          );
        })}
      </div>
      <p className="text-xs opacity-50 mt-3 font-mono">
        🔊 audio dibuat real-time dengan Web Audio API. tutup tab untuk hentikan.
      </p>
    </div>
  );
}
