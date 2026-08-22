/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A100E",
          900: "#0F1714",
          800: "#141F1B",
          700: "#1B2925",
          600: "#243530",
          500: "#33463F",
        },
        surface: {
          DEFAULT: "#121B19",
          raised: "#182320",
          border: "#233029",
        },
        mint: {
          50: "#EAFBF3",
          100: "#CDF5E4",
          300: "#7FE6BF",
          400: "#4CDCAA",
          500: "#2DD4A0",
          600: "#1FAE81",
          700: "#1B8F6C",
          900: "#0F4A38",
        },
        amber: {
          400: "#F5B95A",
          500: "#F2A93B",
          600: "#D98D1F",
        },
        clay: {
          400: "#F0796B",
          500: "#EF5350",
          600: "#D5342F",
        },
        parchment: "#F5F3EC",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(45,212,160,0.08), rgba(45,212,160,0) 60%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(45,212,160,0.25), 0 8px 30px -10px rgba(45,212,160,0.35)",
      },
      keyframes: {
        mend: {
          "0%": { strokeDashoffset: "240" },
          "100%": { strokeDashoffset: "0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        mend: "mend 2.4s ease-out forwards",
        pulseSoft: "pulseSoft 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
