import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        account: {
          blue: "hsl(var(--account-blue))",
          emerald: "hsl(var(--account-emerald))",
          amber: "hsl(var(--account-amber))",
          rose: "hsl(var(--account-rose))",
          violet: "hsl(var(--account-violet))",
        },
        status: {
          published: "hsl(var(--status-published))",
          draft: "hsl(var(--status-draft))",
          archived: "hsl(var(--status-archived))",
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        info: 'hsl(var(--info))',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "aurora": {
          "0%": {
            backgroundPosition: "0% 50%, 100% 50%, 50% 100%",
          },
          "25%": {
            backgroundPosition: "100% 50%, 0% 100%, 50% 0%",
          },
          "50%": {
            backgroundPosition: "50% 100%, 50% 0%, 0% 50%",
          },
          "75%": {
            backgroundPosition: "0% 100%, 100% 0%, 100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%, 100% 50%, 50% 100%",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            opacity: "0.4",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.1)",
          },
        },
        "float-diagonal": {
          "0%": {
            transform: "translate(-100%, 100vh) rotate(0deg)",
            opacity: "0",
          },
          "10%": {
            opacity: "0.6",
          },
          "90%": {
            opacity: "0.6",
          },
          "100%": {
            transform: "translate(100vw, -100%) rotate(360deg)",
            opacity: "0",
          },
        },
        "float-horizontal": {
          "0%": {
            transform: "translateX(-100%) rotate(0deg)",
            opacity: "0",
          },
          "10%": {
            opacity: "0.5",
          },
          "90%": {
            opacity: "0.5",
          },
          "100%": {
            transform: "translateX(100vw) rotate(180deg)",
            opacity: "0",
          },
        },
        "float-vertical": {
          "0%": {
            transform: "translateY(100vh) rotate(0deg)",
            opacity: "0",
          },
          "10%": {
            opacity: "0.4",
          },
          "90%": {
            opacity: "0.4",
          },
          "100%": {
            transform: "translateY(-100%) rotate(-180deg)",
            opacity: "0",
          },
        },
        "spin-slow": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "aurora": "aurora 15s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "float-diagonal": "float-diagonal 20s linear infinite",
        "float-horizontal": "float-horizontal 25s linear infinite",
        "float-vertical": "float-vertical 30s linear infinite",
        "spin-slow": "spin-slow 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
