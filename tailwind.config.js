/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      gradientColorStops: theme => ({
        'primary': '#3B82F6',
        'secondary': '#10B981',
      }),
    },
  },
  plugins: [],
  darkMode: 'class', // This enables dark mode
};