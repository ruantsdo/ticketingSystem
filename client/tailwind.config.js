const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        //Backgrounds
        background: "#e4e4e7",
        cardBackground: "#fafafa",
        navBarBackground: "#7286D3",
        inputBackground: "#27272a",

        darkBackground: "#27272a",
        darkNavBarBackground: "#2B2D42",
        darkInputBackground: "#d0d0d0",

        //Text
        textColor: "#000",
        divider: "#000",

        darkTextColor: "#fff",
        darkDivider: "#fff",

        //Info
        success: "#4CB250",
        failed: "#FF6254",

        darkSuccess: "#2C931F",
        darkFailed: "#CE1E1E",

        //Universal
        alert: "#F5A524",
        info: "#008EDB",
        infoSecondary: "#A946A0",
      },
      keyframes: {
        "pulsate-bck": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.95)" },
        },
        "shadow-drop-center": {
          "0%, 100%": {
            "-webkit-box-shadow": "0 0 0 0 rgba(0, 0, 0, 0)",
            "box-shadow": "0 0 0 0 rgba(0, 0, 0, 0)",
          },
          "50%": {
            "-webkit-box-shadow": "0 0 20px 0px rgba(0, 0, 0, 0.8)",
            "box-shadow": "0 0 20px 0px rgba(0, 0, 0, 0.8)",
          },
        },
      },
      animation: {
        "text-pulse": "pulsate-bck 2s ease-in-out infinite both",
        "shadow-drop-center":
          "3s cubic-bezier(0.250, 0.460, 0.450, 0.940) infinite both",
      },
    },
  },
  plugins: [nextui()],
};
