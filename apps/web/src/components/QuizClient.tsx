"use client";

import { useState } from "react";
import Link from "next/link";

type Q = {
  q: string;
  options: { label: string; tag: string }[];
};

const QUESTIONS: Q[] = [
  {
    q: "Pagi kamu biasanya bagaimana?",
    options: [
      { label: "Buru-buru, butuh tendangan", tag: "kopi" },
      { label: "Pelan, sambil baca", tag: "matcha" },
      { label: "Ngopi sambil ngobrol", tag: "susu" },
      { label: "Nungguin matahari naik", tag: "kopi" },
    ],
  },
  {
    q: "Kamu lebih suka rasa yang…",
    options: [
      { label: "Pekat dan bumi", tag: "kopi" },
      { label: "Manis dan lembut", tag: "susu" },
      { label: "Hijau dan segar", tag: "matcha" },
      { label: "Karamel dan creamy", tag: "susu" },
    ],
  },
  {
    q: "Kalau ke kafe, kamu cari…",
    options: [
      { label: "Sudut tenang buat kerja", tag: "matcha" },
      { label: "Ngumpul sama tetangga", tag: "kopi" },
      { label: "Spot foto-foto cantik", tag: "matcha" },
      { label: "Tempat nongkrong sore", tag: "susu" },
    ],
  },
  {
    q: "Kamu paling suka aroma…",
    options: [
      { label: "Sangrai gosong + cokelat", tag: "kopi" },
      { label: "Daun teh segar", tag: "matcha" },
      { label: "Gula aren dipanasin", tag: "susu" },
      { label: "Pandan dipotong", tag: "matcha" },
    ],
  },
  {
    q: "Saat kamu sedih, kamu cari…",
    options: [
      { label: "Sesuatu yang hangat", tag: "susu" },
      { label: "Sesuatu yang menampar sadar", tag: "kopi" },
      { label: "Sesuatu yang tenang", tag: "matcha" },
      { label: "Sesuatu yang manis", tag: "susu" },
    ],
  },
];

const RESULT: Record<
  string,
  { name: string; vibe: string; desc: string; slug: string }
> = {
  kopi: {
    name: "Kopi Susu Gula Aren",
    vibe: "Si pekerja keras",
    desc: "Kamu butuh yang straight-to-the-point. Espresso pekat, susu sapi segar, dan gula aren cair yang manisnya nempel di lidah.",
    slug: "kopi-susu-gula-aren",
  },
  matcha: {
    name: "Matcha Latte",
    vibe: "Si tenang",
    desc: "Kamu suka yang reflektif. Matcha grade upacara dari Uji, susu hangat — rasa rumput segar yang bikin hari pelan.",
    slug: "matcha-latte",
  },
  susu: {
    name: "Brown Sugar Milk",
    vibe: "Si hangat",
    desc: "Kamu suka yang manis dan akrab. Susu sapi creamy, brown sugar yang dimasak sampai gelap, hangat di kerongkongan.",
    slug: "brown-sugar-milk",
  },
};

export function QuizClient() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    kopi: 0,
    matcha: 0,
    susu: 0,
  });
  const [done, setDone] = useState(false);

  const pick = (tag: string) => {
    setScores((prev) => ({ ...prev, [tag]: (prev[tag] ?? 0) + 1 }));
    if (step + 1 >= QUESTIONS.length) {
      setDone(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setScores({ kopi: 0, matcha: 0, susu: 0 });
    setDone(false);
  };

  const winnerKey =
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "kopi";
  const winner = RESULT[winnerKey];

  if (done) {
    return (
      <div className="rounded-3xl border border-ink/20 bg-paper p-8 text-center">
        <p className="eyebrow mb-3">/ hasil quiz kamu</p>
        <p className="font-mono text-xs opacity-60 lowercase mb-1">
          {winner.vibe}
        </p>
        <h3 className="h-display text-4xl mb-3">{winner.name}</h3>
        <p className="opacity-80 max-w-md mx-auto mb-6">{winner.desc}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href={`/shop/${winner.slug}`} className="btn-primary">
            lihat botolnya
          </Link>
          <button onClick={reset} className="btn-secondary">
            ulangi quiz
          </button>
        </div>
      </div>
    );
  }

  const Q = QUESTIONS[step];
  return (
    <div className="rounded-3xl border border-ink/20 bg-paper p-8">
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs opacity-60 lowercase">
          pertanyaan {step + 1} dari {QUESTIONS.length}
        </p>
        <div className="h-1 w-32 rounded-full bg-ink/10 overflow-hidden">
          <div
            className="h-full bg-orange transition-all"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>
      <h3 className="font-serif italic text-3xl mb-6 leading-tight">{Q.q}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {Q.options.map((o, i) => (
          <button
            key={i}
            onClick={() => pick(o.tag)}
            className="rounded-2xl border border-ink/20 bg-cream px-5 py-4 text-left hover:border-ink hover:bg-ink hover:text-cream transition"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
