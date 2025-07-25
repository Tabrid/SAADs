/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Fira Sans', 'sans-serif'],
        nikosh: ['Nikosh'],
        bookantiqua: ['Book Antiqua'],
      },
      fontWeight: {
        extralight: '200',
      },
    },
  },
  plugins: [],
}