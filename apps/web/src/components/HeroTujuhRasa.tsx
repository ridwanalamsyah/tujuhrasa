"use client";

import Image from "next/image";
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

type BottleSrc = {
  id: string;
  name: string;
  caption: string;
  src: string;
};

const BOTTLES: BottleSrc[] = [
  {
    id: "marie",
    name: "Marie Brown Sugar",
    caption: "kalem · tipis manis",
    src: "/brand/bottles/marie-brown-sugar.webp",
  },
  {
    id: "matcha",
    name: "Matcha",
    caption: "kampus mode",
    src: "/brand/bottles/matcha.webp",
  },
  {
    id: "kopi-susu",
    name: "Kopi Susu Gula Aren",
    caption: "tetangga banget",
    src: "/brand/bottles/kopi-susu.webp",
  },
];

export function HeroTujuhRasa({ today }: { today: string }) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // mouse tracking for tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 110, damping: 20, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 110, damping: 20, mass: 0.4 });

  const rotateY = useTransform(sx, [-1, 1], [-10, 10]);
  const rotateX = useTransform(sy, [-1, 1], [8, -8]);
  const translateX = useTransform(sx, [-1, 1], [-12, 12]);
  const translateY = useTransform(sy, [-1, 1], [-9, 9]);

  // scroll-driven parallax
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 600], [0, -60]);
  const bgParallax = useTransform(scrollY, [0, 600], [0, 50]);
  const scribbleParallax = useTransform(scrollY, [0, 600], [0, -30]);

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
      {/* one soft cocoa blob, parallax */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: bgParallax }}
        className="pointer-events-none absolute -right-32 -top-40 w-[680px] h-[680px] rounded-full bg-[var(--tr-cocoa)] opacity-95"
      />

      <div className="container-tr relative pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
          {/* ── LEFT: HANDWRITING-FIRST COPY ── */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            {/* one single date pill, restrained */}
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--tr-text-muted)] mb-4">
              {today} &middot; Bandung
            </p>

            <p className="font-hand text-5xl sm:text-6xl text-[var(--tr-cocoa)] -rotate-[1deg] mb-1">
              tujuh.rasa —
            </p>

            <h1 className="font-display font-black text-[clamp(56px,9vw,138px)] leading-[0.92] tracking-[-0.03em] text-[var(--tr-ink)]">
              taste the vibe,
              <br />
              <span className="italic font-light text-[var(--tr-cocoa)]">
                feel the rasa.
              </span>
            </h1>

            <p className="font-hand text-3xl sm:text-4xl text-[var(--tr-brick)] mt-6 -rotate-[0.5deg]">
              pilih rasa, pilih suasana, pilih kamu.
            </p>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[var(--tr-text-soft)]">
              Kopi &amp; matcha botolan dibuat segar, halal,
              <em className="text-[var(--tr-ink)] not-italic font-semibold">
                {" "}
                Rp 10K&ndash;13K
              </em>{" "}
              per botol. Antar Bandung &amp; sekitar pakai GoSend / GrabExpress.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/shop" className="btn btn-primary">
                pesan sekarang &rarr;
              </Link>
              <Link href="/langganan" className="btn btn-secondary">
                langganan mingguan
              </Link>
            </div>

            <p className="font-hand text-2xl text-[var(--tr-text-muted)] mt-8 -rotate-[1deg]">
              psst&hellip; bayar dulu, akun belakangan
              <span className="not-italic"> &mdash;</span> boleh.
            </p>
          </motion.div>

          {/* ── RIGHT: POSTER + ANIMATED BOTTLES ── */}
          <motion.div
            ref={containerRef}
            style={reduce ? undefined : { y: heroParallax }}
            className="relative h-[460px] sm:h-[560px] lg:h-[640px]"
          >
            {/* hand-drawn scribble accent (parallax) */}
            <motion.svg
              aria-hidden
              viewBox="0 0 320 80"
              style={reduce ? undefined : { y: scribbleParallax }}
              className="pointer-events-none absolute -top-2 left-2 w-44 opacity-80"
            >
              <path
                d="M 8 50 Q 60 10 120 40 T 240 30 T 310 60"
                fill="none"
                stroke="var(--tr-cocoa)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </motion.svg>

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
              <BottleFloater
                spec={BOTTLES[0]}
                reduce={!!reduce}
                position="left"
              />
              <BottleFloater
                spec={BOTTLES[1]}
                reduce={!!reduce}
                position="center"
              />
              <BottleFloater
                spec={BOTTLES[2]}
                reduce={!!reduce}
                position="right"
              />
            </motion.div>

            {/* handwriting captions (no live pill, no flashy badges) */}
            {!reduce && (
              <>
                <motion.p
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="absolute left-0 top-8 z-20 font-hand text-2xl text-[var(--tr-ink)] -rotate-[6deg] hidden sm:block"
                >
                  marie ♡
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="absolute right-2 top-16 z-20 font-hand text-2xl text-[var(--tr-matcha-deep)] rotate-[4deg] hidden sm:block"
                >
                  matcha ↗
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                  className="absolute left-1/4 bottom-2 z-20 font-hand text-2xl text-[var(--tr-cocoa)] rotate-[2deg] hidden sm:block"
                >
                  kopi susu &mdash; 10K
                </motion.p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function BottleFloater({
  spec,
  reduce,
  position,
}: {
  spec: BottleSrc;
  reduce: boolean;
  position: "left" | "center" | "right";
}) {
  const layout =
    position === "center"
      ? {
          wrap: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[85%] z-20",
          baseRotate: 0,
          floatRange: 14,
          floatDuration: 5.6,
          floatDelay: 0,
          enterX: 0,
          enterY: 30,
          enterDelay: 0.25,
        }
      : position === "left"
      ? {
          wrap: "absolute left-0 top-[18%] w-[42%] h-[64%] z-10",
          baseRotate: -8,
          floatRange: 10,
          floatDuration: 4.8,
          floatDelay: 0.6,
          enterX: -30,
          enterY: 20,
          enterDelay: 0.5,
        }
      : {
          wrap: "absolute right-0 top-[22%] w-[44%] h-[62%] z-10",
          baseRotate: 7,
          floatRange: 11,
          floatDuration: 5.2,
          floatDelay: 1.1,
          enterX: 30,
          enterY: 20,
          enterDelay: 0.7,
        };

  const initial = reduce
    ? false
    : {
        opacity: 0,
        x: layout.enterX,
        y: layout.enterY,
        rotate: layout.baseRotate,
      };

  const enter = reduce
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0, rotate: layout.baseRotate };

  const floatAnim = reduce ? undefined : { y: [0, -layout.floatRange, 0] };

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
      style={reduce ? undefined : { transformOrigin: "50% 60%" }}
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
        className="relative w-full h-full"
        style={{
          filter:
            "drop-shadow(0 22px 18px rgba(26,20,16,0.30)) drop-shadow(0 6px 0 rgba(26,20,16,0.12))",
        }}
      >
        <Image
          src={spec.src}
          alt={spec.name}
          fill
          sizes="(min-width:1024px) 30vw, 60vw"
          className="object-contain select-none pointer-events-none"
          priority={position === "center"}
        />
      </motion.div>
    </motion.div>
  );
}


