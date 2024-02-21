import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/component/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  theme: {
    colors: {
      "s-bg-dark": "rgb(var(--s-bg-dark)/1)",
      "s-bg-light": "rgb(var(--s-bg-light)/1)",
      "s-white": "rgb(var(--s-white)/1)",
      "s-purple": "rgb(var(--s-purple)/1)",
      "s-pink": "rgb(var(--s-pink)/1)",
      "s-pink-halo": "rgb(var(--s--halo)/1)",
    },
    extend: {
      fontFamily: {
        body: ["var(--overpass)"],
        display: ["var(--fabulistextended)"],
      },
    },
  },
};
export default config;