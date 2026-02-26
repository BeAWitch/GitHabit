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
          darkMuted: '#57606a',
          darkCanvas: '#161b22', // Used for cards/secondary backgrounds
          darkActive: '#c9d1d9', // Used for active states
          darkLink: '#58a6ff',
          darkPrimary: '#238636',
          darkSuccess: '#238636',
          
          lightBg: '#ffffff',
          lightBorder: '#d0d7de',
          lightText: '#24292f',
          lightMuted: '#6a737d',
          lightCanvas: '#f6f8fa',
          lightActive: '#24292f', // Used for active states
          lightLink: '#0969da',
          lightPrimary: '#1f883d', // Main button green
          lightSuccess: '#1f883d',
          
          // Contribution Graph Colors (Dark Theme Base)
          darkLevel0: '#161b22',       // Empty cell
          darkLevel1: '#0e4429',       // Lowest intensity
          darkLevel2: '#006d32',       // Moderate
          darkLevel3: '#26a641',       // High
          darkLevel4: '#39d353',       // Maximum intensity
          
          // Contribution Graph Colors (Light Theme Base)
          lightLevel0: '#ebedf0',
          lightLevel1: '#9be9a8',
          lightLevel2: '#40c463',
          lightLevel3: '#30a14e',
          lightLevel4: '#216e39',
        }
      },
    },
  },
  plugins: [],
}
