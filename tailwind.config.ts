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
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 5px #00fff2, 0 0 20px #00fff2, 0 0 40px #00fff2",
        "neon-green": "0 0 5px #39ff14, 0 0 20px #39ff14",
      },
    },
  },
  plugins: [],
};

export default config;
