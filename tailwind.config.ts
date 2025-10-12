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
        dark: {
          primary: '#0A0A1A',
          secondary: '#16163A',
          card: '#1E1E3F',
          hover: '#252552',
        },
        neon: {
          pink: '#FF00FF',
          purple: '#A020F0',
          blue: '#00BFFF',
          cyan: '#00FFFF',
          green: '#00FF7F',
        },
        text: {
          light: '#FFFFFF',
          secondary: '#A0A0C0',
          muted: '#6A6A8E',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        'neon-pink': '0 0 5px #FF00FF, 0 0 20px #FF00FF',
        'neon-blue': '0 0 5px #00BFFF, 0 0 20px #00BFFF',
        'neon-cyan': '0 0 5px #00FFFF, 0 0 20px #00FFFF',
        'neon-purple': '0 0 5px #A020F0, 0 0 20px #A020F0',
        'neon-green': '0 0 5px #00FF7F, 0 0 20px #00FF7F',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
