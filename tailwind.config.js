/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class', // Enable manual dark mode switching via NativeWind class strategy
  theme: {
    extend: {
      colors: {
        // GitHub Theme Palettes mapped for Tailwind utility classes
        github: {
          // General mapping
          darkBg: '#0d1117',
          darkBorder: '#30363d',
          darkText: '#c9d1d9',
          darkCanvas: '#161b22', // Used for cards/secondary backgrounds
          
          lightBg: '#ffffff',
          lightBorder: '#d0d7de',
          lightText: '#24292f',
          lightCanvas: '#f6f8fa',
          
          // The Core Action Green
          primaryDark: '#238636',   // Main button green
          primaryLight: '#1f883d',
          
          // Contribution Graph Colors (Dark Theme Base)
          level0: '#161b22',       // Empty cell
          level1: '#0e4429',       // Lowest intensity
          level2: '#006d32',       // Moderate
          level3: '#26a641',       // High
          level4: '#39d353',       // Maximum intensity
          
          // Contribution Graph Colors (Light Theme Base)
          levelL0: '#ebedf0',
          levelL1: '#9be9a8',
          levelL2: '#40c463',
          levelL3: '#30a14e',
          levelL4: '#216e39',
        }
      },
    },
  },
  plugins: [],
}