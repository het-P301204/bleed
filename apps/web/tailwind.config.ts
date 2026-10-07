import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#171717',
        ivory: '#F5F0E7',
        stone: '#E6DED1',
        coral: '#E45D4B',
        marigold: '#D6A944',
        sage: '#7F9B80',
        iris: '#9082B0',
        plum: '#513D4F',
        surface: '#1E1E1E',
        border: '#2A2A2A',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '28px',
      },
    },
  },
  plugins: [],
} satisfies Config
