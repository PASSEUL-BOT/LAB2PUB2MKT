import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213D",
        paper: "#FAFAF7",
        line: "#DADDE3",
        teal: {
          DEFAULT: "#0F6E6E",
          dark: "#0B5757",
          light: "#E4F1F0",
        },
        amber: "#B8860B",
        slate: {
          DEFAULT: "#5B6472",
          light: "#8A93A0",
        },
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "960px",
      },
    },
  },
  plugins: [],
};

export default config;
