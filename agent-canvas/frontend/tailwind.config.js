/** @type {import('tailwindcss').Config} */
import { nextui } from "@nextui-org/react";
import typography from '@tailwindcss/typography';

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-accent': '#f54e00',
        'brand-cream': '#f7f7f4',
        'brand-dark': '#0a0e0a',
        'root-primary': 'var(--bg-dark)',
        'root-secondary': 'var(--bg-light)',
        'hyperlink': '#f54e00',
        'danger': '#EF3744',
        'success': '#4CAF50',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderColor: {
        hairline: 'rgba(38, 37, 30, 0.08)',
        'hairline-dark': 'rgba(255, 255, 255, 0.08)',
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      defaultTheme: "dark",
      layout: {
        radius: {
          small: "4px",
          large: "12px",
        },
      },
      themes: {
        dark: {
          colors: {
            primary: "#f54e00",
            focus: "#f54e00",
            background: "#0a0e0a",
          },
        },
        light: {
          colors: {
            primary: "#f54e00",
            focus: "#f54e00",
            background: "#f7f7f4",
          },
        },
      },
    }),
    typography,
  ],
};
