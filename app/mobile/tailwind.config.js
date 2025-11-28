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
        primary: '#F5A9C8', // Soft Pink from PDF
        primaryDark: '#E680A6',
        primaryLight: '#FCE7F0',
        secondary: '#4A4A4A', // Dark Gray text
        secondaryLight: '#9CA3AF', // Light gray text
        background: '#FFFFFF',
        card: '#FFFFFF',
        inputBg: '#FAFAFA',
      },
      borderRadius: {
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}