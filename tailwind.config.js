/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{tsx,ts}"
  ],
  theme: {
    extend: {
      colors: {
        "white": "var(--white)",
        "accent": {
          DEFAULT: "var(--accent-color)",
          two: "var(--accent-color-two)", 
          lowOpacity: "var(--accent-low-opacity)"
        },
        "bg-color": "var(--bg-color)",
        "grey-one": "var(--grey-one)",
        "grey-two": "var(--grey-two)",
        "grey-three": "var(--grey-three)",
        "grey-four": "var(--grey-four)",
        "grey-five": "var(--grey-five)",
        "grey-six": "var(--grey-six)",
        "grey-seven": "var(--grey-seven)",
        "grey-eight": "var(--grey-eight)",
        "grey-nine": "var(--grey-nine)",
        "grey-ten": "var(--grey-ten)",
        "grey-eleven": "var(--grey-eleven)",
        "red-one": "var(--red-one)",
      },
      boxShadow: {
        "drop-shadow-one": "var(--drop-shadow-one)",
      },
      transitionTimingFunction: {
        "bezier-one": "var(--bezier-one)",
      },
    },
  },
  plugins: [],
}

