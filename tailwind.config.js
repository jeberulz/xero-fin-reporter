/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        xero: { blue:"#0C9DD7", blueDark:"#0A7FB0", sky:"#E6F6FC", ink:"#1F2937", slate:"#385266" }
      },
      boxShadow: { xcard: "0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.10)" },
      borderRadius: { xl2: "1rem" }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}