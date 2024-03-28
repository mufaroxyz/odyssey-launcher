const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{tsx,ts}"],
  theme: {
    extend: {
      colors: {
        white: "var(--white)",
        modal: {
          DEFAULT: "var(--modal-bg)",
        },
        accent: {
          DEFAULT: "var(--accent-color)",
          two: "var(--accent-color-two)",
          lowOpacity: "var(--accent-low-opacity)",
        },
        "bg-color": "var(--bg-color)",
        "sidebar-bg-color": "var(--sidebar-bg-color)",
        button: {
          DEFAULT: "var(--button)",
          hover: "var(--button-hover)",
          dark: "var(--button-dark)",
        },
        input: {
          DEFAULT: "var(--input)",
          hover: "var(--input-hover)",
          border: "var(--input-border)",
        },
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
  plugins: [require("tailwindcss-animate"), addVariablesForColors],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
