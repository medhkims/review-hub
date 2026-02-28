/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './presentation/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'neon-purple': '#A855F7',
        midnight: '#0F172A',
        'card-dark': '#1E293B',
        'border-dark': '#334155',
        'rating-gold': '#FBBF24',
      },
    },
  },
  plugins: [],
};
