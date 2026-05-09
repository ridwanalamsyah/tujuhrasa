import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f7efde",
        "cream-2": "#f3e6c4",
        paper: "#fbf6ec",
        ink: "#5b1a14",
        "ink-soft": "#7a2e25",
        orange: "#e07a3c",
        "orange-2": "#d97757",
        tan: "#d4c1a0",
        olive: "#7e8c5a",
        leaf: "#3f8260",
        sky: "#4f6d8a",
        plum: "#8a6dab",
        // rasa palette
        rasa: {
          manis: "#e07a3c",
          pahit: "#3a1410",
          asam: "#c5b045",
          gurih: "#7e8c5a",
          rempah: "#a04a2a",
          bumi: "#5a4632",
          hangat: "#d97757"
        }
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "ui-monospace", "monospace"],
        hand: ["var(--font-caveat)", "Caveat", "cursive"],
        body: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        bottle: "32px"
      }
    }
  },
  plugins: []
};

export default config;
