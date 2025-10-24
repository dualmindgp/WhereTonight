/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./AppNew.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Colores EXACTOS de la web
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
      },
    },
  },
  plugins: [],
}
