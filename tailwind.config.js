// module.exports = {
//   content: [`./views/**/*.html`], // all .html files
//   theme: {
//     extend: {},
//   },
//   plugins: [require('@tailwindcss/typography')],
// };

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/**/*.ejs`], 
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["sunset"],
  },
  plugins: [
    require('@tailwindcss/typography'), 
    require('daisyui'),
  ],
}

