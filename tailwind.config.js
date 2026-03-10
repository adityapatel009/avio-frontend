/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#12121E',
        secondary: '#1A1A2E',
        gold: '#C0A060',
        'gold-light': '#D4B483',
        'gold-dark': '#A08040',
        card: '#1E1E30',
        border: '#2A2A40',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}