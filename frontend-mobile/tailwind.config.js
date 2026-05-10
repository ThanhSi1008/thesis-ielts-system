/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FFC600",
        secondary: "#EDEDED",
        success: "#4CAF50",
        danger: "#F44336",
        info: "#2196F3",
        warning: "#FF9800",
        dark: "#212529",
        light: "#f8f9fa",
        "level-1": "#FFC600",
        "level-2": "#5B9557",
        "level-3": "#E74C3C",
        "level-4": "#3B82F6"
      },
      fontFamily: {
        sans: ["Farro-Regular", "sans-serif"],
        farro: ["Farro-Regular", "sans-serif"],
        "farro-light": ["Farro-Light", "sans-serif"],
        "farro-medium": ["Farro-Medium", "sans-serif"],
        "farro-bold": ["Farro-Bold", "sans-serif"],
      }
    },
  },
  plugins: [],
}
