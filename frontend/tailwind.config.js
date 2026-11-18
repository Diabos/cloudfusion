import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f9fb",
        foreground: "#0f172a",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      defaultTheme: "light",
      themes: {
        light: {
          colors: {
            background: "#f7f9fb",
            foreground: "#0f172a",
            primary: {
              DEFAULT: "#2563eb",
              foreground: "#ffffff",
            },
            default: {
              DEFAULT: "#e8edf3",
              foreground: "#334155",
              50: "#f8fafc",
              100: "#f1f5f9",
              200: "#e2e8f0",
              300: "#cbd5e1",
              400: "#64748b",
              500: "#475569",
              600: "#334155",
              700: "#1e293b",
              800: "#172033",
              900: "#0f172a",
            },
            danger: {
              DEFAULT: "#dc2626",
              foreground: "#ffffff",
            },
          },
        },
        dark: {
          colors: {
            background: "#0b1120",
            foreground: "#e5edf8",
            content1: "#111b2e",
            content2: "#172236",
            content3: "#1f2c44",
            divider: "#263650",
            primary: {
              DEFAULT: "#60a5fa",
              foreground: "#0b1120",
            },
            default: {
              DEFAULT: "#172236",
              foreground: "#a9b8cc",
              50: "#24344e",
              100: "#263650",
              200: "#344863",
              300: "#7185a0",
              400: "#91a4be",
              500: "#a9b8cc",
              600: "#c1ccda",
              700: "#d3dce8",
              800: "#e5edf8",
              900: "#f4f7fb",
            },
            danger: {
              DEFAULT: "#f87171",
              foreground: "#1f0b0b",
            },
          },
        },
      },
    }),
  ],
};
