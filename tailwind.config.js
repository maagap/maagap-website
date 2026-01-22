/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'maagap-blue': '#1e3a8a',
        'maagap-red': '#991b1b',
        'maagap-yellow': '#fbbf24',
      },
    },
  },
  plugins: [],
}
