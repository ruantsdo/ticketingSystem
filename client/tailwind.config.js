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
        alert: "#F5A524",
        info: "#008EDB",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      prefix: "nextui",
      addCommonColors: false,
      defaultTheme: "light",
      defaultExtendTheme: "light",
      layout: {},
      themes: {
        light: {
          layout: {},
          colors: {
            primary: "",
            secondary: "",
            background: "#fff",
            containerBackground: "#d0d0d0",
            navBarBackground: "#7286D3",
            inputBackground: "#27272a",
            success: "#4CB250",
            failed: "#FF6254",
            defaultTextColor: "#000",
            divider: "#000",
          },
        },
        dark: {
          layout: {},
          colors: {
            primary: "",
            secondary: "#27374D",
            background: "#ffffff",
            containerBackground: "#27272a",
            navBarBackground: "#2B2D42",
            inputBackground: "#d0d0d0",
            success: "#2C931F",
            failed: "#CE1E1E",
            defaultTextColor: "#fff",
            divider: "#fff",
          },
        },
      },
    }),
  ],
};
