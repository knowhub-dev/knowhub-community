import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "Inter var", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        "primary-light": "hsl(var(--primary-light))",
        secondary: "hsl(var(--secondary))",
        "accent-pink": "hsl(var(--accent-pink))",
        "accent-purple": "hsl(var(--accent-purple))",
        "accent-green": "hsl(var(--accent-green))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      boxShadow: {
        subtle: "0 20px 45px -20px rgba(15, 15, 20, 0.55)",
        neon: "0 0 25px rgba(79, 70, 229, 0.45)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
    },
  },
  plugins: [forms],
};

export default config;
