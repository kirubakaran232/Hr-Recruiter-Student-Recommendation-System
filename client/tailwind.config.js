/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#242424',
        muted: '#6f6f68',
        cream: '#f7f4e9',
        panel: '#fffdf5',
        honey: '#ffdc5d',
        smoke: '#eceae3'
      },
      boxShadow: {
        soft: '0 24px 80px rgba(36, 36, 36, 0.14)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
