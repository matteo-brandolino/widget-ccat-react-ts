import daisyui from "daisyui";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,css}"],
  theme: {
    extend: {
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
        width: "width",
        fadetransform: "opacity, transform",
      },
      maxWidth: {
        "1/2": "50%",
      },
      minWidth: {
        "1/2": "50%",
      },
    },
  },
  plugins: [daisyui],
  darkMode: ["class", '[data-theme="dark"]'],
  prefix: "ccat-",
  daisyui: {
    logs: false,
    themes: [
      {
        light: {
          primary: "#4169E1",
          secondary: "#3454B4",
          accent: "#E39476",
          neutral: "#383938",
          "base-100": "#F4F4F5",
          info: "#38BDF8",
          success: "#2DC659",
          warning: "#EAB308",
          error: "#EF4444",
        },
      },
      {
        dark: {
          primary: "#E39476",
          secondary: "#B5765E",
          accent: "#4169E1",
          neutral: "#F4F4F5",
          "base-100": "#383938",
          info: "#38BDF8",
          success: "#2DC659",
          warning: "#EAB308",
          error: "#EF4444",
        },
      },
    ],
  },
};
