/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0a",
          900: "#111111",
          800: "#1b1b1b",
          700: "#2b2b2b",
          600: "#4a4a4a",
          400: "#8a8a86",
        },
        paper: {
          DEFAULT: "#ffffff",
          50: "#ffffff",
          100: "#f8f8f6",
          200: "#f0f0ec",
          300: "#e4e4df",
        },
        indigo: {
          500: "#4F46E5",
          400: "#6C63EE",
        },
        coral: {
          500: "#FF6B57",
          400: "#FF8571",
        },
        teal: {
          500: "#14B8A6",
          400: "#2DD4C0",
        },
        amber: {
          500: "#F5A623",
          400: "#FFBB4D",
        },
        violet: {
          500: "#8B5CF6",
          400: "#A78BFA",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
