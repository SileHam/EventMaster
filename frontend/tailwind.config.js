/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eaf7f6',
          100: '#cdecea',
          500: '#1e8189',
          600: '#166a73',
          700: '#11535c',
          900: '#12343b',
        },
        secondary: {
          50: '#fff5dc',
          500: '#d99a1e',
          600: '#b87912',
        },
      },
    },
  },
  plugins: [],
}
