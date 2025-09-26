/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: {
          100: '#f0fdf4',
          200: '#dcfce7',
          300: '#bbf7d0',
          400: '#86efac',
          500: '#4ade80',
          600: '#22c55e',
          700: '#16a34a',
          800: '#166534',
          900: '#14532d',
        },
        herbal: {
          100: '#ecfdf5',
          200: '#d1fae5',
          300: '#a7f3d0',
          400: '#6ee7b7',
          500: '#34d399',
          600: '#10b981',
          700: '#059669',
          800: '#047857',
          900: '#065f46',
        }
      },
    },
  },
  plugins: [],
}
