import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-red': '#DC2626',
        'dark-red': '#7F1D1D',
        'light-red': '#FEE2E2',
      },
    },
  },
  plugins: [
    forms,
  ],
}
