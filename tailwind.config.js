/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // for App Router
    './pages/**/*.{js,ts,jsx,tsx}', // for Pages Router
    './components/**/*.{js,ts,jsx,tsx}', // your components
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2F4F4F',
        secondary: '#E6B325',
        accent: '#046A38',
        light: '#F5F5F5',
        dark: '#1A1A1A',
      }
    },
  },
  plugins: [],
};