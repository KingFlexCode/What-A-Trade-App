/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Outfit', 'ui-sans-serif', 'system-ui'],
        mono:  ['DM Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Brand
        accent:  { DEFAULT: '#5b8af0', hover: '#4a77d4', dim: '#5b8af015', border: '#5b8af028' },
        // Semantic
        green:   { DEFAULT: '#22d87a', dim: '#22d87a14', border: '#22d87a28', text: '#1aad60' },
        red:     { DEFAULT: '#f05b6b', dim: '#f05b6b14', border: '#f05b6b28', text: '#c23d4a' },
        amber:   { DEFAULT: '#f0b45b', dim: '#f0b45b12', border: '#f0b45b25' },
        purple:  { DEFAULT: '#a78bfa', dim: '#a78bfa14', border: '#a78bfa25' },
        // Dark-mode surfaces
        dark:    { 0: '#08090d', 1: '#0e1017', 2: '#13151e', 3: '#1a1d28', 4: '#20243a' },
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.10)',
        subtle:  'rgba(255,255,255,0.16)',
        strong:  'rgba(255,255,255,0.26)',
      },
    },
  },
  plugins: [],
}
