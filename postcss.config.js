let plugins = [
  require('autoprefixer'),
  require('postcss-import'),
  require('postcss-reporter')
];
const purge = require('@fullhuman/postcss-purgecss')({
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './app/index.html',
    '@trussworks/react-uswds/lib/index.css'
  ],
  safelist: {
    deep: [/usa-banner$/, /welcome-banner$/],
    greedy: [/^usa-banner/]
  }
});

if (process.env.NODE_ENV !== 'development') plugins = [...plugins, purge];

module.exports = {
  syntax: 'postcss-scss',
  parser: 'postcss-safe-parser',
  plugins
};
