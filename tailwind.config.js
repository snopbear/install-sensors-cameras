/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#602650",
        customRed: "#EF5261",
        danger: "#EF5261",
        veryLightGray: "#F8F7F7",
        lightGray: "#707070",
        darkGray: "#4A4F54",
        customGreen: "#68AD6F",
        lightSky: "#1EC0B5",
        customEmerald: "#33B489",
        customRed: "#F43F5E",
      },
      fontFamily: {
        // Add your custom fonts here
        sans: ['"Open Sans"', "sans-serif"], // Example with Google Font
        heading: ['"Montserrat"', "sans-serif"], // Example for headings
        // You can add more font families as needed
      },
    },
  },
  plugins: [
    // require("tailwindcss-rtl"), // Add RTL support
  ],
};
