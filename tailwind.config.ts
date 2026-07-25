import type { Config } from 'tailwindcss';

// LUNARO design tokens.
// Colour, type and spacing are centralised here so no component ever
// hardcodes a hex value or font stack — see docs/README.md "Design system".
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#050505', // page background
        deepblack: '#0A0A0A', // raised surfaces
        charcoal: '#151515', // cards, inputs
        graphite: '#242424', // borders, dividers
        lunar: '#F2F0EB', // primary text on dark
        editorial: '#E8E4DC', // warm secondary white
        mist: '#A7A7A7', // secondary / muted text
        silver: '#BFC2C7', // metallic accent — used sparingly
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'], // cinematic headlines
        sans: ['var(--font-sans)', 'sans-serif'], // interface + commerce
      },
      fontSize: {
        // Cinematic scale — generous, art-directed, not evenly stepped.
        'display-xl': ['clamp(3.5rem, 9vw, 8.5rem)', { lineHeight: '0.94', letterSpacing: '-0.01em' }],
        'display-lg': ['clamp(2.75rem, 6vw, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.01em' }],
        'display-md': ['clamp(2rem, 4vw, 3.25rem)', { lineHeight: '1.02' }],
        'eyebrow': ['0.75rem', { lineHeight: '1', letterSpacing: '0.24em' }],
      },
      letterSpacing: {
        wider2: '0.18em',
        wider3: '0.24em',
      },
      maxWidth: {
        container: '1440px',
      },
      transitionTimingFunction: {
        lunar: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backgroundImage: {
        terminator: 'linear-gradient(90deg, transparent, rgba(191,194,199,0.55) 45%, rgba(191,194,199,0.9) 50%, rgba(191,194,199,0.55) 55%, transparent)',
      },
      keyframes: {
        'crescent-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'crescent-in': 'crescent-in 1.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-up': 'fade-up 0.9s cubic-bezier(0.16,1,0.3,1) forwards',
        float: 'float 8s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio'), require('@tailwindcss/typography')],
};

export default config;
