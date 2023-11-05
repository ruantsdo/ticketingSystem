const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "gradient-to-r from-cyan-500 to-blue-500",
        secondary: "",
        alert: "#E07B0F",
        success: "#4E911B",
        failed: "#CE1E1E",
        info: "#008EDB",

        dark: {
          primary: "",
          secondary: "#27374D",
          background: "#282A3A",
          navBarBackground: "#2B2D42",
          success: "#4E911B",
        },
        light: {
          primary: "",
          secondary: "",
          background: "#F4FAFF",
          navBarBackground: "#8FACE1",
          success: "#A2F897",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
