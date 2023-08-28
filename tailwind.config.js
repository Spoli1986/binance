/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx}",
		"./src/components/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./src/app/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			textColor: {
				"purple-gradient":
					"gradient-to-r from-purple-800 via-violet-900 to-purple-800",
			},
			fontFamily: {
				mortal: ["MK4"],
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
				header_bg:
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
				// "url('/public/assets/cryptocurrency-coding-digital-black-background-open-source-blockchain-concept.jpg')",
			},
		},
	},
	plugins: [],
};
