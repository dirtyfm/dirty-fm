import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        dirty: {
          black: "#080807",
          gray: "#B7B2A8",
          red: "#D12A1F",
          yellow: "#D6B84A",
          green: "#4E6B4A",
          purple: "#3B263F",
          blue: "#2D4F73",
          ash: "#DED8C9",
          coal: "#12110F"
        }
      },
      fontFamily: {
        display: [
          "Impact",
          "Haettenschweiler",
          "Arial Narrow Bold",
          "sans-serif"
        ],
        body: ["Inter", "IBM Plex Sans", "Arial", "sans-serif"],
        utility: ["IBM Plex Mono", "Courier New", "monospace"]
      },
      maxWidth: {
        shell: "1180px"
      },
      boxShadow: {
        signal: "0 1rem 3rem rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
