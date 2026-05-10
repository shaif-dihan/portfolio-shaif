/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      fontSize: {
        xs: ["0.845rem", { lineHeight: "1.3rem" }],
        sm: ["1.138rem", { lineHeight: "1.69rem" }],
        base: ["1.3rem", { lineHeight: "1.95rem" }],
        lg: ["1.43rem", { lineHeight: "2.08rem" }],
        xl: ["1.625rem", { lineHeight: "2.275rem" }],
        "2xl": ["1.95rem", { lineHeight: "2.6rem" }],
        "3xl": ["2.438rem", { lineHeight: "2.925rem" }],
        "4xl": ["2.925rem", { lineHeight: "3.25rem" }],
        "5xl": ["3.9rem", { lineHeight: "1.1" }],
        "6xl": ["4.875rem", { lineHeight: "1.1" }],
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
