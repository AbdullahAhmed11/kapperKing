/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#6B46C1", // Restore original hardcoded default
          // Keep original shades for now, though they won't be dynamic
          50: "#F3F0FB",
          100: "#E9E4F8",
          200: "#D5CBF1",
          300: "#C1B2EA",
          400: "#AD99E3",
          500: "#9980DC",
          600: "#8567D5",
          700: "#714ECE",
          800: "#6B46C1", // Original default
          900: "#5A3BA3",
          950: "#4E3289"
        },
        brand: {
          purple: "#6B46C1",
          pink: "#E84393"
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary))", // Use HSL format
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
          DEFAULT: "hsl(var(--color-accent))", // Use HSL format
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
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6B46C1 0%, #E84393 100%)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Add typography customizations here
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'), // Base text color
            h1: {
              color: theme('colors.gray.900'),
              fontWeight: '700',
            },
            h2: {
              color: theme('colors.gray.800'),
              fontWeight: '600',
            },
            h3: {
              color: theme('colors.gray.800'),
              fontWeight: '600',
            },
            'h1, h2, h3, h4, h5, h6': {
              marginTop: theme('spacing.6'),
              marginBottom: theme('spacing.3'),
            },
            p: {
              lineHeight: '1.7', // Improve readability
              marginTop: theme('spacing.4'),
              marginBottom: theme('spacing.4'),
            },
            a: {
              color: theme('colors.primary.DEFAULT'),
              '&:hover': {
                color: theme('colors.primary.700'),
              },
            },
            // Add more customizations as needed for lists, blockquotes, etc.
          },
        },
        lg: { // Customize large prose styles if needed, inherits from DEFAULT
          css: {
            p: {
              lineHeight: '1.75',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'), // Add the typography plugin
  ],
};