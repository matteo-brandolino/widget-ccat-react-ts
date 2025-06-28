/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "ccat-primary": "#6366f1",
        "ccat-secondary": "#8b5cf6",
      },
    },
  },
  plugins: [],
  prefix: "ccat-",
  corePlugins: {
    preflight: false,
  },
};
