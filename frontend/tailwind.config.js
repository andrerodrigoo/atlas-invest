/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta da Parte 2 - Design System
        primary: {
          DEFAULT: "#0B3D2E", // verde escuro
          light: "#146C4E",
        },
        secondary: {
          DEFAULT: "#0F4C5C", // azul petróleo
        },
        gold: "#C9A227", // destaque Premium
        surface: {
          light: "#F5F6F5",
          dark: "#0E1512",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
