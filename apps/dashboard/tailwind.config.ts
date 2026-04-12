import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Syne", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      colors: {
        fuse: {
          black:  "#0a0a0a",
          carbon: "#111111",
          zinc:   "#1a1a1a",
          border: "#2a2a2a",
          muted:  "#6b6b6b",   /* was #444444 — lifted for readability */
          text:   "#f0f0f0",   /* was #e8e8e8 — slightly brighter */
          dim:    "#ababab",   /* was #888888 — readable secondary text */
          red:    "#ff3333",
          orange: "#ff8c00",
          yellow: "#ffd700",
          green:  "#00ff88",
          blue:   "#4488ff",
          purple: "#cc44ff",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-up":   "slideUp 0.4s ease forwards",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;