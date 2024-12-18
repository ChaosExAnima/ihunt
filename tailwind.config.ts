import type { Config } from "tailwindcss";
import pluginAnimate from "tailwindcss-animate";

export default {
	content: [
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	plugins: [pluginAnimate],
} satisfies Config;
