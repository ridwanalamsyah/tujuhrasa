"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { Bottle } from "@/components/Bottle";

const RASA = [
  { id: "kopi-susu", name: "Kopi Susu Gula Aren", price: "Rp 10K", tint: "var(--tr-susu)" },
  { id: "matcha", name: "Matcha", price: "Rp 10K", tint: "var(--tr-matcha)" },
  { id: "cokelat", name: "Cokelat", price: "Rp 12K", tint: "#c4a78a" },
  { id: "taro", name: "Taro", price: "Rp 12K", tint: "#cbb4d9" },
  { id: "susu-kurma", name: "Susu Kurma", price: "Rp 13K", tint: "#d6bd99" },
  { id: "kopi-pandan", name: "Kopi Pandan", price: "Rp 12K", tint: "#b9c79f" },
  { id: "red-velvet", name: "Red Velvet", price: "Rp 13K", tint: "#c98b89" },
];

type BottleSpec = {
  sku: string;
  name: string;
  accentHex: string;
  liquidHex: string;
  labelHex: string;
  inkHex: string;
  liquidPct: number;
  shape: "tall" | "stout";
};

const BOTTLES: BottleSpec[] = [
  {
    sku: "TR-KOPI-SUSU",
    name: "Kopi Susu",
    accentHex: "#d8b88a",
    liquidHex: "#8a5a36",
    labelHex: "#f5e9c8",
    inkHex: "#3a1410",
    liquidPct: 0.78,
    shape: "tall",
  },
  {
    sku: "TR-MATCHA",
    name: "Matcha",
    accentHex: "#cfd8a8",
    liquidHex: "#7a8a3a",
    labelHex: "#f5e9c8",
    inkHex: "#2b3a14",
    liquidPct: 0.72,
    shape: "tall",
  },
  {
    sku: "TR-COKELAT",
    name: "Cokelat",
    accentHex: "#c4a78a",
    liquidHex: "#5a3624",
    labelHex: "#f5e9c8",
    inkHex: "#3a1410",
    liquidPct: 0.74,
    shape: "stout",
  },
];

export function HeroTujuhRasa({ today }: { today: string }) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // mouse tracking for tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.4 });

  const rotateY = useTransform(sx, [-1, 1], [-14, 14]);
  const rotateX = useTransform(sy, [-1, 1], [10, -10]);
  const translateX = useTransform(sx, [-1, 1], [-16, 16]);
  const translateY = useTransform(sy, [-1, 1], [-12, 12]);

  // scroll-driven parallax
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 600], [0, -80]);
  const bgParallax = useTransform(scrollY, [0, 600], [0, 40]);
  const bottleScrollRotate = useTransform(scrollY, [0, 800], [0, -8]);

  useEffect(() => {
    if (reduce) return;
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      mx.set((e.clientX - cx) / (r.width / 2));
      my.set((e.clientY - cy) / (r.height / 2));
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my, reduce]);

  return (
    <section className="relative overflow-hidden border-b-2 border-[var(--tr-ink)] bg-[var(--tr-cream)]">
      {/* big chocolate organic shape, parallax */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: bgParallax }}
        className="pointer-events-none absolute -right-24 -top-24 w-[640px] h-[640px] rounded-full bg-[var(--tr-cocoa)] opacity-90"
      />
      {/* secondary leaf shape */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: bgParallax }}
        className="pointer-events-none absolute right-[60%] -bottom-32 w-[420px] h-[420px] rounded-full bg-[var(--tr-matcha)] opacity-60 blur-[2px]"
      />
      {/* dotted grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, var(--tr-ink) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="container-tr relative pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          {/* ── LEFT: COPY ── */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="pill bg-[var(--tr-paper)]">
                <span aria-hidden>●</span>
                {today}
              </span>
              <span className="pill bg-[var(--tr-matcha-soft)] border-[var(--tr-matcha-deep)] text-[var(--tr-matcha-deep)]">
                halal · PET 250ml
              </span>
              <span className="pill bg-[var(--tr-paper-2)]">
                Bandung &amp; sekitar
              </span>
            </div>

            <h1 className="font-display font-black text-[clamp(52px,9vw,140px)] leading-[0.9] tracking-[-0.03em] text-[var(--tr-ink)]">
              Taste the Vibe,
              <br />
              <span className="italic text-[var(--tr-cocoa)]">
                Feel the Rasa.
              </span>
            </h1>

            <p className="font-hand text-3xl sm:text-4xl text-[var(--tr-cocoa)] mt-5">
              kopi &amp; matcha botolan dari kampus —
            </p>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[var(--tr-text-soft)]">
              Tujuh varian rasa kekinian — kopi susu gula aren, matcha, cokelat,
              taro, susu kurma — dibuat segar di Bandung, diantar GoSend /
              GrabExpress sampai depan kost atau kantormu.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/shop" className="btn btn-primary">
                Pesan sekarang →
              </Link>
              <Link href="/langganan" className="btn btn-secondary">
                Langganan kampus
              </Link>
            </div>

            <ul className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 max-w-2xl">
              {[
                { k: "01", v: "Halal & thayyib" },
                { k: "02", v: "Tanpa pengawet" },
                { k: "03", v: "PET 250ml" },
                { k: "04", v: "Antar hari ini" },
              ].map((s, i) => (
                <motion.li
                  key={s.k}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="border-t-2 border-[var(--tr-ink)] pt-3"
                >
                  <p className="font-mono text-[10px] tracking-widest text-[var(--tr-text-muted)] uppercase">
                    {s.k}
                  </p>
                  <p className="text-sm font-display font-bold mt-0.5">{s.v}</p>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ── RIGHT: ANIMATED BOTTLE CLUSTER ── */}
          <motion.div
            ref={containerRef}
            style={reduce ? undefined : { y: heroParallax }}
            className="relative h-[480px] sm:h-[560px] lg:h-[640px]"
          >
            {/* soft splash backdrop */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-6 top-10 bottom-10 rounded-[40%_60%_55%_45%/55%_45%_60%_40%] bg-[var(--tr-paper)] border-2 border-[var(--tr-ink)]"
              style={{ boxShadow: "8px 12px 0 var(--tr-ink)" }}
            />

            {/* corner price stamp */}
            <div className="absolute -top-2 left-2 z-30 bg-[var(--tr-mustard)] border-2 border-[var(--tr-ink)] rounded-sm px-3 py-1.5 shadow-[3px_4px_0_var(--tr-ink)] rotate-[-6deg]">
              <p className="font-display font-black text-2xl leading-none">10K</p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--tr-ink)]">
                /botol
              </p>
            </div>

            {/* handle stamp */}
            <div className="absolute -bottom-2 right-3 z-30 bg-[var(--tr-ink)] text-[var(--tr-paper)] rounded-sm px-3 py-1.5 shadow-[3px_4px_0_var(--tr-cocoa)] border-2 border-[var(--tr-ink)] rotate-[3deg]">
              <p className="font-mono text-[10px] uppercase tracking-widest">
                @tujuh.rasa
              </p>
            </div>

            {/* tilt + scroll-driven 3D wrapper */}
            <motion.div
              style={
                reduce
                  ? undefined
                  : {
                      rotateX,
                      rotateY,
                      x: translateX,
                      y: translateY,
                      transformPerspective: 1400,
                    }
              }
              className="absolute inset-0 z-10"
            >
              {/* three floating bottles */}
              <BottleFloater
                spec={BOTTLES[0]}
                reduce={!!reduce}
                position="left"
                scrollRotate={bottleScrollRotate}
              />
              <BottleFloater
                spec={BOTTLES[1]}
                reduce={!!reduce}
                position="center"
                scrollRotate={bottleScrollRotate}
              />
              <BottleFloater
                spec={BOTTLES[2]}
                reduce={!!reduce}
                position="right"
                scrollRotate={bottleScrollRotate}
              />
            </motion.div>

            {/* floating rasa tags */}
            {!reduce && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 30, y: -20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute -left-3 top-6 z-20 hidden sm:block"
                >
                  <div className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-matcha)] px-3 py-1.5 shadow-[2px_3px_0_var(--tr-ink)] rotate-[-4deg]">
                    <p className="font-mono text-[10px] uppercase tracking-widest font-bold">
                      MATCHA · 10K
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -30, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  className="absolute -right-2 top-1/3 z-20 hidden sm:block"
                >
                  <div className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-susu)] px-3 py-1.5 shadow-[2px_3px_0_var(--tr-ink)] rotate-[6deg]">
                    <p className="font-mono text-[10px] uppercase tracking-widest font-bold">
                      KOPI SUSU · 10K
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="absolute -left-4 bottom-10 z-20 hidden sm:block"
                >
                  <div className="rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-mustard-soft)] px-3 py-1.5 shadow-[2px_3px_0_var(--tr-ink)] rotate-[3deg]">
                    <p className="font-mono text-[10px] uppercase tracking-widest font-bold">
                      HALAL CERT.
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>

        {/* 7 rasa list */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-14 lg:mt-20 flex flex-wrap items-center gap-x-6 gap-y-2 border-t-2 border-[var(--tr-ink)] pt-6"
        >
          <p className="eyebrow">7 rasa hari ini</p>
          {RASA.map((r) => (
            <span
              key={r.id}
              className="font-display font-bold text-base flex items-center gap-2"
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-[var(--tr-ink)]"
                style={{ background: r.tint }}
              />
              {r.name}
              <span className="font-mono text-xs text-[var(--tr-text-muted)]">
                · {r.price}
              </span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BottleFloater({
  spec,
  reduce,
  position,
  scrollRotate,
}: {
  spec: BottleSpec;
  reduce: boolean;
  position: "left" | "center" | "right";
  scrollRotate: ReturnType<typeof useTransform<number, number>>;
}) {
  // Layout per slot — center bottle largest & frontmost
  const layout =
    position === "center"
      ? {
          wrap: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[58%] h-[78%] z-20",
          baseRotate: 0,
          floatRange: 14,
          floatDuration: 5.6,
          floatDelay: 0,
          enterX: 0,
          enterY: 40,
          enterDelay: 0.25,
        }
      : position === "left"
      ? {
          wrap: "absolute left-[2%] top-[16%] w-[42%] h-[64%] z-10",
          baseRotate: -10,
          floatRange: 11,
          floatDuration: 4.8,
          floatDelay: 0.6,
          enterX: -40,
          enterY: 30,
          enterDelay: 0.5,
        }
      : {
          wrap: "absolute right-[2%] top-[22%] w-[44%] h-[62%] z-10",
          baseRotate: 8,
          floatRange: 12,
          floatDuration: 5.2,
          floatDelay: 1.1,
          enterX: 40,
          enterY: 30,
          enterDelay: 0.7,
        };

  const enter = reduce
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0, rotate: layout.baseRotate };

  const initial = reduce
    ? false
    : {
        opacity: 0,
        x: layout.enterX,
        y: layout.enterY,
        rotate: layout.baseRotate,
      };

  const floatAnim =
    reduce
      ? undefined
      : {
          y: [0, -layout.floatRange, 0],
        };

  return (
    <motion.div
      initial={initial}
      animate={enter}
      transition={{
        duration: 0.9,
        delay: layout.enterDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={layout.wrap}
      style={
        reduce
          ? undefined
          : {
              transformOrigin: "50% 60%",
              rotate: scrollRotate,
            }
      }
    >
      <motion.div
        animate={floatAnim}
        transition={
          reduce
            ? undefined
            : {
                duration: layout.floatDuration,
                delay: layout.floatDelay,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        className="w-full h-full"
        style={{
          filter:
            "drop-shadow(0 24px 18px rgba(26,20,16,0.30)) drop-shadow(4px 6px 0 var(--tr-ink))",
        }}
      >
        <Bottle
          svg=""
          name={spec.name}
          sku={spec.sku}
          accentHex={spec.accentHex}
          liquidHex={spec.liquidHex}
          labelHex={spec.labelHex}
          inkHex={spec.inkHex}
          liquidPct={spec.liquidPct}
          shape={spec.shape}
          className="w-full h-full"
        />
      </motion.div>
    </motion.div>
  );
}
