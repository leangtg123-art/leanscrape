import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--lc-primary)",
        accent: "var(--lc-accent)",
        bg: "var(--lc-bg)",
        "bg-elevated": "var(--lc-bg-elevated)",
        text: "var(--lc-text)",
        "text-muted": "var(--lc-text-muted)",
        border: "var(--lc-border)",
      },
      boxShadow: {
        glow: "var(--lc-glow)",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      animation: {
        "scanline-sweep": "scanline-sweep 3s linear infinite",
        "pulse-glow": "pulse-glow 2s infinite ease-in-out",
        "marquee-left": "marquee-left 30s linear infinite",
        "marquee-right": "marquee-right 30s linear infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "float-delayed": "float-delayed 8s ease-in-out infinite",
        "blink-cursor": "blink-cursor 1s step-end infinite",
      },
      keyframes: {
        "scanline-sweep": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(var(--lc-primary-rgb), 0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(var(--lc-primary-rgb), 0.6)" },
        },
        "marquee-left": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "blink-cursor": {
          "from, to": { borderColor: "transparent" },
          "50%": { borderColor: "currentColor" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
