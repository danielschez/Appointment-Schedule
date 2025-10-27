/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.7s ease-out forwards',
        'slide-up-delay': 'slide-up 0.7s ease-out forwards 0.15s',
        'fade-in': 'fade-in 0.7s ease-out forwards',
        'fade-in-delay': 'fade-in 0.7s ease-out forwards 0.3s',
      },
    },
  },
  plugins: [],
}

