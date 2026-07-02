/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        panel: "0 18px 50px rgba(6, 13, 22, 0.28)",
        control: "0 10px 24px rgba(10, 22, 34, 0.24)"
      },
      colors: {
        ink: "#18212b",
        peat: "#27313b",
        moss: "#75a860",
        river: "#4f91b9",
        amberline: "#e7b75b"
      }
    }
  },
  plugins: []
};
