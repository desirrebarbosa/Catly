/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F5A9C8',
        primaryDark: '#E089A8',
        secondary: '#2E3E5C',
        inputBg: '#F9F9F9',
      },
    },
  },
  plugins: [],
}