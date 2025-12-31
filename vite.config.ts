import viteFastify from '@fastify/vite/plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		viteFastify(),
		tanstackRouter({
			autoCodeSplitting: true,
			target: 'react',
		}),
		tailwindcss(),
		react(),
		VitePWA({
			manifest: {
				description: 'We help you hunt for success!',
				icons: [
					{
						sizes: '192x192',
						src: 'android-chrome-192x192.png',
						type: 'image/png',
					},
					{
						sizes: '512x512',
						src: 'android-chrome-512x512.png',
						type: 'image/png',
					},
				],
				name: 'iHunt',
				theme_color: 'oklch(51.4% 0.222 16.935)',
			},
			registerType: 'autoUpdate',
		}),
	],
	resolve: {
		alias: [
			{ find: '@', replacement: resolve(import.meta.dirname, './src') },
			{
				find: '@/server',
				replacement: resolve(import.meta.dirname, './server/index.ts'),
			},
		],
	},
	root: 'src',
	server: {
		allowedHosts: ['ihunt.local'],
		strictPort: true,
	},
});
