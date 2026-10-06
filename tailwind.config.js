/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        abj: {
          night: "#080d14",
          panel: "#101925",
          card: "#152233",
          green: "#27d17f",
          gold: "#f4b342",
          coral: "#ff6b57",
          sky: "#54c5ff"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(39, 209, 127, 0.16)"
      }
    }
  },
  plugins: []
};
