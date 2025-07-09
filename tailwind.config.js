/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // for App Router
    './pages/**/*.{js,ts,jsx,tsx}', // for Pages Router
    './components/**/*.{js,ts,jsx,tsx}', // your components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};