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
        neon: {
          cyan: "#00fff2",
          green: "#39ff14",
          pink: "#ff006e",
          blue: "#2563eb",
        },
        // Mothership PDF-inspired warm industrial palette
        "ms-amber": {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 5px #00fff2, 0 0 20px #00fff2, 0 0 40px #00fff2",
        "neon-green": "0 0 5px #39ff14, 0 0 20px #39ff14",
        "ms-amber": "0 0 5px rgba(245,158,11,0.4), 0 0 20px rgba(245,158,11,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
