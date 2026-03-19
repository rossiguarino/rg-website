/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#3D6B7E',
          'teal-light': '#5A8A9D',
          'teal-dark': '#2C5060',
          black: '#1A1A1A',
          gray: '#6B7280',
          'gray-light': '#F5F5F5',
        }
      },
      fontFamily: {
        sans: ['Akzidenz Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Akzidenz Grotesk Bold', 'Inter', 'system-ui', 'sans-serif'],
        accent: ['Esmarya', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'brand': '0.15em',
        'brand-wide': '0.25em',
      }
    },
  },
  plugins: [],
}
