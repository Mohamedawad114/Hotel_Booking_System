/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0F2A2E',
          50: '#EAF0EF',
          100: '#CBDAD9',
          400: '#3F6A6B',
          600: '#1B4245',
          900: '#0F2A2E',
        },
        sand: {
          DEFAULT: '#F6F3EC',
          100: '#FBFAF6',
          200: '#F6F3EC',
          300: '#EDE7D8',
        },
        amber: {
          DEFAULT: '#D9A441',
          400: '#E4B75E',
          600: '#B9822C',
        },
        coral: {
          DEFAULT: '#E2593F',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      boxShadow: {
        soft: '0 8px 30px -8px rgba(15, 42, 46, 0.18)',
      },
    },
  },
  plugins: [],
};
