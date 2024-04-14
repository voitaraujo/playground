import type { Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/components/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-geist-sans)'],
				mono: ['var(--font-geist-mono)'],
			},
		},
	},
	plugins: [],
	darkMode: 'class',
};
export default config;
