/** @type {import('tailwindcss').Config} */
module.exports = {
  // @ts-expect-error - nativewind preset
  presets: [require('nativewind/preset')],
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
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
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-glow': '0 0 25px 5px rgba(168, 85, 247, 0.6), 0 0 50px 10px rgba(168, 85, 247, 0.4)',
        'card': '0 10px 30px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-purple': 'pulsePurple 3s ease-in-out infinite',
      },
      keyframes: {
        pulsePurple: {
          '0%, 100%': {
            boxShadow: '0 0 25px 5px rgba(168, 85, 247, 0.6), 0 0 50px 10px rgba(168, 85, 247, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 35px 10px rgba(168, 85, 247, 0.8), 0 0 60px 15px rgba(168, 85, 247, 0.5)',
          },
        },
      },
    },
  },
  plugins: [],
};
