const {nextui} = require("@nextui-org/react");

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors:{
        primary: 'gradient-to-r from-cyan-500 to-blue-500',
        secondary: '',
        alert: '#E07B0F',
        success: '#4E911B',
        failed: '#CE1E1E',
        info: '#008EDB',

          dark:{
            primary: '',
            secondary: '',
            background: '#272932',
            navBarBackground: '#2B2D42',
          },
          light:{
            primary: '',
            secondary: '',
            background: '#EFF7FF',
            background2: '#FFFAFB',
            navBarBackground: '#8FACE1',
          },
      }
    },
  },
  darkMode: "class",
  plugins: [nextui()],
}


