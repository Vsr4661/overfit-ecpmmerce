/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4f2ee",
        surface: "#ffffff",
        ink: "#111111",
        muted: "#6b6760",
        line: "#dcd8d0",
        accent: { DEFAULT: "#ff4d1a", ink: "#b8300a" },
        success: "#1f7a4d",
        danger: "#c22a1f",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-archivo)", "var(--font-inter)", "sans-serif"],
      },
      letterSpacing: {
        label: "0.14em",
      },
      maxWidth: {
        page: "80rem",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};
