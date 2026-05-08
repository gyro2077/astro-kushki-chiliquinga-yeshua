/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "#080f11",
        "ai-purple": "#8B5CF6",
        "surface-bright": "#333a3c",
        "text-primary": "#F8FAFC",
        "on-surface-variant": "#CBD5E1",
        "ai-cyan": "#06B6D4",
        "status-alive": "#10B981",
        "bg-main": "#0F172A",
        "status-dead": "#EF4444",
        "status-unknown": "#F59E0B",
        "text-secondary": "#CBD5E1",
        "surface-container": "#192122",
        "surface-glass": "rgba(30, 41, 59, 0.8)",
        "primary-container": "#00e5ff",
        "on-primary-container": "#00626e"
      },
      spacing: {
        "grid-gutter": "24px",
        "card-padding": "20px",
        "container-max": "1440px",
        "section-padding": "64px",
        "element-gap": "12px"
      },
      fontFamily: {
        "h1": ["Inter", "sans-serif"],
        "h2": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "code-snippet": ["JetBrains Mono", "monospace"],
        "body-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"]
      }
    }
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")]
};
