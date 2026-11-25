/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        angkor: {
          gold: '#D4AF37',
          'gold-light': '#FDE68A',
          'gold-dark': '#926F1B',
          sapphire: '#0F2557',
          'sapphire-light': '#1E3A8A',
          crimson: '#B91C1C',
          emerald: '#047857',
          sand: '#FAF6F0',
          obsidian: '#0B1120',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Kantumruy Pro"', 'sans-serif'],
        khmer: ['"Kantumruy Pro"', '"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Kantumruy Pro"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
