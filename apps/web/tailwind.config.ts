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
        orange: "var(--tr-orange)",
        "orange-soft": "var(--tr-orange-soft)",
        "orange-deep": "var(--tr-orange-deep)",
        leaf: "var(--tr-leaf)",
        "leaf-soft": "var(--tr-leaf-soft)",
        "leaf-deep": "var(--tr-leaf-deep)",
        plum: "var(--tr-plum)",
        "plum-soft": "var(--tr-plum-soft)",
        sky: "var(--tr-sky)",
        "sky-soft": "var(--tr-sky-soft)",
        cocoa: "var(--tr-cocoa)",
        "cocoa-soft": "var(--tr-cocoa-soft)",
        // Legacy aliases (kept so existing pages don't crash)
        "cream-2": "var(--tr-paper-2)",
        tan: "#d4c1a0",
        olive: "var(--tr-leaf)",
        "orange-2": "var(--tr-orange-deep)",
        rasa: {
          manis: "var(--tr-orange)",
          pahit: "var(--tr-cocoa)",
          asam: "#c5b045",
          gurih: "var(--tr-leaf)",
          rempah: "var(--tr-orange-deep)",
          bumi: "var(--tr-cocoa)",
          hangat: "var(--tr-orange)",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "ui-monospace", "monospace"],
        hand: ["var(--font-caveat)", "Caveat", "cursive"],
        body: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        bottle: "32px",
      },
      animation: {
        "float-slow": "tr-float 6s ease-in-out infinite",
        "float-base": "tr-float 4.5s ease-in-out infinite",
        "float-fast": "tr-float 3.2s ease-in-out infinite",
        wobble: "tr-wobble 0.6s ease-in-out",
        shimmer: "tr-shimmer 2.4s linear infinite",
        "draw-in": "tr-draw 1.4s var(--tr-ease) forwards",
        "fade-up": "tr-fade-up 0.6s var(--tr-ease) forwards",
        "ticker": "tr-ticker 22s linear infinite",
      },
      keyframes: {
        "tr-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "tr-wobble": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "30%": { transform: "rotate(-3deg)" },
          "60%": { transform: "rotate(2deg)" },
        },
        "tr-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "tr-draw": {
          "to": { strokeDashoffset: "0" },
        },
        "tr-fade-up": {
          "from": { opacity: "0", transform: "translateY(14px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        "tr-ticker": {
          "from": { transform: "translateX(0)" },
          "to": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
