/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#0f172a', panel: '#1e293b', border: '#334155',
          text: '#e2e8f0', muted: '#94a3b8', accent: '#3b82f6',
          danger: '#ef4444', warning: '#f59e0b', success: '#10b981',
        }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], mono: ['Fira Code', 'monospace'] }
    },
  },
  plugins: [],
}