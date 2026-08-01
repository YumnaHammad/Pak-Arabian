/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Token-driven surfaces (theme aware via CSS vars) ── */
        base: 'rgb(var(--c-base) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        elevated: 'rgb(var(--c-elevated) / <alpha-value>)',
        veil: 'rgb(var(--c-veil) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        hairline: 'rgb(var(--c-line) / <alpha-value>)',

        /* ── Fixed brand pigments ──
           Straight off the wordmark. `brand` is the ground the logo sits on and
           stays constant in both moods — it is the identity, not the theme. */
        brand: {
          DEFAULT: '#1D4A45',
          deep: '#143331',
          light: '#245751',
        },
        obsidian: '#0E2321',
        char: '#0E0E10',
        graphite: '#1A1A1E',
        smoke: '#26262B',
        cream: '#F5F1E3',
        bone: '#E7E2D8',
        gold: {
          DEFAULT: '#D4AF37',
          soft: '#D8B860',
          champagne: '#F0E3B6',
          deep: '#8C6B2F',
        },
        bronze: '#8C6B3F',
        emerald: {
          DEFAULT: '#1F5F4B',
          /* Brightened so the in-stock dot still separates from the teal
             ground — the old #3E8F72 sat too close to it to register. */
          light: '#5FD1A4',
        },
        olive: '#3B402C',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        /* Editorial display scale — fluid, clamped */
        'display-sm': ['clamp(2.5rem, 6vw, 4rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(3.5rem, 9vw, 7rem)', { lineHeight: '0.92', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(4.5rem, 13vw, 11rem)', { lineHeight: '0.88', letterSpacing: '-0.03em' }],
        'display-xl': ['clamp(5rem, 18vw, 17rem)', { lineHeight: '0.84', letterSpacing: '-0.04em' }],
      },
      letterSpacing: {
        eyebrow: '0.32em',
        wide: '0.16em',
      },
      maxWidth: {
        editorial: '78rem',
        prose: '38rem',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.16, 1, 0.3, 1)',
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
        drape: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        'veil-rise': {
          '0%': { transform: 'translate3d(0,102%,0)' },
          '100%': { transform: 'translate3d(0,0,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-160% 0' },
          '100%': { backgroundPosition: '260% 0' },
        },
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-14px,0)' },
        },
        'grain-shift': {
          '0%,100%': { transform: 'translate(0,0)' },
          '10%': { transform: 'translate(-5%,-10%)' },
          '30%': { transform: 'translate(3%,-15%)' },
          '50%': { transform: 'translate(-8%,4%)' },
          '70%': { transform: 'translate(6%,10%)' },
          '90%': { transform: 'translate(-3%,6%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 3.4s cubic-bezier(0.4,0,0.2,1) infinite',
        drift: 'drift 7s cubic-bezier(0.45,0,0.55,1) infinite',
        'grain-shift': 'grain-shift 900ms steps(1) infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.16,1,0.3,1) infinite',
      },
      backgroundImage: {
        'gold-leaf':
          'linear-gradient(100deg, #8C6B2F 0%, #D4AF37 22%, #F0E3B6 42%, #D4AF37 62%, #8C6B2F 100%)',
        'veil-b': 'linear-gradient(to bottom, transparent, rgb(var(--c-base)))',
        'veil-t': 'linear-gradient(to top, transparent, rgb(var(--c-base)))',
      },
      boxShadow: {
        lift: '0 32px 90px -30px rgba(0,0,0,0.75)',
        halo: '0 0 0 1px rgba(212,175,55,0.28), 0 22px 70px -24px rgba(212,175,55,0.28)',
      },
    },
  },
  plugins: [],
};
