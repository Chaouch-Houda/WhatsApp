/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./Screens/*.{js,jsx,ts,tsx},./Screens/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: ["nativewind/babel"],
}

