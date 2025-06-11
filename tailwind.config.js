/** @type {import('tailwindcss').Config} */
export const darkMode = 'class';

export const content = [
  './index.html',
  './src/**/*.{js,jsx,ts,tsx}',
];

export const theme = {
  extend: {
    colors: {
      primary: {
        50: '#F2F5FF',
        100: '#D6DBFF',
        200: '#B6C3FF',
        300: '#9AB0FF',
        400: '#7D99FF',
        500: '#5E7EFF',
        600: '#4F68E6',
        700: '#4050B3',
        800: '#303983',
        900: '#202652',
      },
      secondary: {
        50: '#FFF2F8',
        100: '#FFD6E3',
        200: '#FFB6CC',
        300: '#FF99B6',
        400: '#FF7FA3',
        500: '#FF5F8E',
        600: '#E64E7B',
        700: '#B33B62',
        800: '#802A48',
        900: '#4D1A2E',
      },
      accent: {
        50: '#EFFCF5',
        100: '#C6F7E2',
        200: '#8EEDD1',
        300: '#5CE5BF',
        400: '#31D6A4',
        500: '#10B981',
        600: '#09976B',
        700: '#027B58',
        800: '#05603A',
        900: '#054F31',
      },
      neutral: {
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#E5E5E5',
        300: '#D4D4D4',
        400: '#A3A3A3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
      },
      milk: '#fcfcf9',
    },
    boxShadow: {
      card: '0 4px 12px rgba(0, 0, 0, 0.08)',
      hoverCard: '0 8px 20px rgba(0, 0, 0, 0.12)',
      dropdown: '0 8px 16px rgba(0, 0, 0, 0.1)',
      navbar: '0 2px 8px rgba(0, 0, 0, 0.06)',
    },
    borderRadius: {
      xl: '1rem',
      '2xl': '1.5rem',
    },
  },
};

export const plugins = [];
