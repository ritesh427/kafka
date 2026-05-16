/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kafka: {
          light: '#f5f5f5',
          dark: '#1a1a1a',
          orange: '#ef4444', // Confluent-like accent
        }
      }
    },
  },
  plugins: [],
}
