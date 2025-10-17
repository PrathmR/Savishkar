/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A2511',
          50: '#F5E6D3',
          100: '#F0DFC8',
          200: '#E8D5B7',
          300: '#D4B896',
          400: '#A67C52',
          500: '#4A2511',
          600: '#6B3619',
          700: '#8B4513',
          800: '#5C2E0F',
          900: '#3D1E0A',
        },
        secondary: {
          DEFAULT: '#1B2A5E',
          50: '#E8EAF6',
          100: '#C5CAE9',
          200: '#9FA8DA',
          300: '#7986CB',
          400: '#5C6BC0',
          500: '#1B2A5E',
          600: '#162350',
          700: '#111C42',
          800: '#0C1534',
          900: '#070E26',
        },
        beige: {
          DEFAULT: '#F5E6D3',
          light: '#FAF0E6',
          dark: '#E8D5B7',
        },
        brown: {
          DEFAULT: '#4A2511',
          light: '#6B3619',
          dark: '#3D1E0A',
        },
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
          },
          '50%': { 
            backgroundPosition: '100% 50%',
          },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px)',
          },
          '50%': { 
            transform: 'translateY(-20px)',
          },
        },
        glow: {
          '0%': {
            boxShadow: '0 0 5px rgba(99, 102, 241, 0.5), 0 0 10px rgba(99, 102, 241, 0.3)',
          },
          '100%': {
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.8), 0 0 30px rgba(99, 102, 241, 0.5)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
