import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* shadcn CSS variable-based colors */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        /* CivicNode brand colors (existing) */
        navy: {
          DEFAULT: "#0F2D5A",
          50: "#E8EEF5",
          100: "#C5D3E6",
          200: "#9BB2D1",
          300: "#7091BC",
          400: "#4F76AB",
          500: "#2F5B99",
          600: "#1E4478",
          700: "#0F2D5A",
          800: "#0A1F3E",
          900: "#0A1628",
          950: "#060D18",
        },
        purple: {
          DEFAULT: "#4B3F9E",
          50: "#EEEDF8",
          100: "#D5D2EE",
          200: "#B3ADE0",
          300: "#9088D2",
          400: "#6E63C4",
          500: "#4B3F9E",
          600: "#3D3382",
          700: "#2F2766",
          800: "#211B4A",
          900: "#13102E",
          950: "#0A0817",
        },
        teal: {
          DEFAULT: "#0D7B6A",
          50: "#E6F5F2",
          100: "#C0E8E1",
          200: "#8DD6CA",
          300: "#5AC3B3",
          400: "#33B09F",
          500: "#0D9E89",
          600: "#0D7B6A",
          700: "#0A5F52",
          800: "#07433A",
          900: "#042722",
        },
        "amber-gov": {
          DEFAULT: "#B8860B",
          50: "#FDF6E3",
          100: "#FAE9B8",
          200: "#F5D47A",
          300: "#E8B93C",
          400: "#D4A01E",
          500: "#B8860B",
          600: "#946C09",
          700: "#705207",
          800: "#4C3805",
          900: "#281E03",
        },
        "danger-gov": {
          DEFAULT: "#A61C00",
          50: "#FDE8E3",
          100: "#F9C5BA",
          200: "#F09282",
          300: "#E65F4A",
          400: "#D4361D",
          500: "#A61C00",
          600: "#851600",
          700: "#641100",
          800: "#430B00",
          900: "#220600",
        },
        ghana: {
          red: "#CE1126",
          gold: "#F5C842",
          green: "#006B3F",
        },
        surface: {
          light: "#F0F4F8",
          dark: "#0A1628",
        },
      },
      fontFamily: {
        heading: ["var(--font-sora)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        btn: "8px",
        card: "12px",
        modal: "16px",
      },
      fontSize: {
        "page-title": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "section-header": ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        "card-title": ["16px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
        label: ["12px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        modal: "0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "blink-cursor": "blink 1s step-end infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bar-grow": "barGrow 0.5s ease-out forwards",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "0" },
        },
        barGrow: {
          "0%": { width: "0%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
