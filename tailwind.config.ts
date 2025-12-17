import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        akusho: {
          neon: "#00A8FF",
          neonDark: "#0052A3",
          dark: "#0A0F1F",
          darker: "#05070D",
          deepest: "#02060F",
        },
      },
      boxShadow: {
        neon: "0 0 20px #00A8FF",
        neonSoft: "0 0 10px #0052A3",
        neonStrong: "0 0 40px #00A8FF, 0 0 80px #0052A3",
      },
      fontFamily: {
        heading: ["Oswald", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      animation: {
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { textShadow: "0 0 20px #00A8FF, 0 0 40px #00A8FF" },
          "50%": { textShadow: "0 0 10px #00A8FF, 0 0 20px #0052A3" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px #00A8FF" },
          "100%": { boxShadow: "0 0 40px #00A8FF, 0 0 60px #0052A3" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
