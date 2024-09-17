/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}",    
    "./components/**/*.{js,jsx,ts,tsx}", // Add this line
    "./routes/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // gradientColorStops: theme => ({
      //   'primary': '#3B82F6',
      //   'secondary': '#10B981',
      // }),
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dim"],
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
  // darkMode: 'class', // This enables dark mode
};