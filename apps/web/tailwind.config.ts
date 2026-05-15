import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bridge to CSS tokens (preferred):
        cream: "var(--tr-cream)",
        paper: "var(--tr-paper)",
        "paper-2": "var(--tr-paper-2)",
        "paper-3": "var(--tr-paper-3)",
        ink: "var(--tr-ink)",
        "ink-soft": "var(--tr-ink-soft)",
        "ink-muted": "var(--tr-ink-muted)",
        "ink-subtle": "var(--tr-ink-subtle)",
        brick: "var(--tr-brick)",
        "brick-soft": "var(--tr-brick-soft)",
        "brick-deep": "var(--tr-brick-deep)",
        mustard: "var(--tr-mustard)",
        "mustard-soft": "var(--tr-mustard-soft)",
        "mustard-deep": "var(--tr-mustard-deep)",
        // Legacy: orange now aliases brick for back-compat
        orange: "var(--tr-brick)",
        "orange-soft": "var(--tr-brick-soft)",
        "orange-deep": "var(--tr-brick-deep)",
        leaf: "var(--tr-leaf)",
        "leaf-soft": "var(--tr-leaf-soft)",
        "leaf-deep": "var(--tr-leaf-deep)",
        plum: "var(--tr-plum)",
        "plum-soft": "var(--tr-plum-soft)",
        sky: "var(--tr-sky)",
        "sky-soft": "var(--tr-sky-soft)",
        cocoa: "var(--tr-cocoa)",
        "cocoa-soft": "var(--tr-cocoa-soft)",
        "cream-2": "var(--tr-paper-2)",
        tan: "#d4c1a0",
        olive: "var(--tr-leaf)",
        "orange-2": "var(--tr-brick-deep)",
        rasa: {
          manis: "var(--tr-brick)",
          pahit: "var(--tr-cocoa)",
          asam: "var(--tr-mustard)",
          gurih: "var(--tr-leaf)",
          rempah: "var(--tr-brick-deep)",
          bumi: "var(--tr-cocoa)",
          hangat: "var(--tr-brick)",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        display: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "ui-monospace", "monospace"],
        hand: ["var(--font-caveat)", "Caveat", "cursive"],
        patrick: ["var(--font-patrick)", "Patrick Hand", "cursive"],
        body: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        bottle: "20px",
      },
      boxShadow: {
        stamp: "var(--tr-shadow-stamp)",
        "stamp-hover": "var(--tr-shadow-stamp-hover)",
        "stamp-sm": "var(--tr-shadow-stamp-sm)",
      },
      animation: {
        "fade-up": "tr-fade-up 0.5s var(--tr-ease) forwards",
      },
      keyframes: {
        "tr-fade-up": {
          "from": { opacity: "0", transform: "translateY(8px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
