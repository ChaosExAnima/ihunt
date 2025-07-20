import viteFastify from '@fastify/vite/plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		viteFastify(),
		tanstackRouter({
			autoCodeSplitting: true,
			target: 'react',
		}),
		tailwindcss(),
		react(),
	],
	resolve: {
		alias: [
			{ find: '@', replacement: resolve(import.meta.dirname, './src') },
		],
	},
	root: 'src',
});
