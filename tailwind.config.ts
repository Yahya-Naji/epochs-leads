import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          page: "#f8f9fc",
          card: "#ffffff",
          elevated: "#f3f4f8",
          border: "#e5e7f0",
          "border-strong": "#d1d5e8",
        },
        primary: {
          DEFAULT: "#6366f1",
          light: "#eef2ff",
          muted: "#a5b4fc",
          dark: "#4338ca",
        },
        ink: {
          DEFAULT: "#111827",
          secondary: "#4b5563",
          muted: "#9ca3af",
          faint: "#d1d5db",
        },
        success: { DEFAULT: "#10b981", light: "#d1fae5", muted: "#6ee7b7" },
        danger:  { DEFAULT: "#ef4444", light: "#fee2e2", muted: "#fca5a5" },
        warning: { DEFAULT: "#f59e0b", light: "#fef3c7", muted: "#fcd34d" },
        info:    { DEFAULT: "#3b82f6", light: "#dbeafe", muted: "#93c5fd" },
        violet:  { DEFAULT: "#8b5cf6", light: "#ede9fe", muted: "#c4b5fd" },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        wave: "wave 1.2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
