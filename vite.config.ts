import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tanstackRouter({
			autoCodeSplitting: true,
			target: 'react',
		}),
		tailwindcss(),
		react(),
	],
	root: 'client',
});
