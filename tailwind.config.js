/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {},
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        ByteOJLight: {
          ...require("daisyui/src/theming/themes")["emerald"],
          primary: "#497af3",
          success: "#00c36f",
          error: "#ff6a6b",
          info: "#8eecc3",
          warning: "#f2a53f",
          secondary: "#353c4c",
        },
        ByteOJDark: {
          ...require("daisyui/src/theming/themes")["dracula"],
        },
      },
    ],
  },
};
