import viteFastify from '@fastify/vite/plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, PluginOption } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	build: {
		outDir: resolve(__dirname, 'dist'),
	},
	plugins: [
		viteFastify({
			spa: true,
			useRelativePaths: true,
		}),
		tanstackRouter({
			autoCodeSplitting: true,
			generatedRouteTree: 'routeTree.gen.ts',
			routesDirectory: 'routes',
			target: 'react',
		}),
		tailwindcss(),
		react(),
		VitePWA({
			devOptions: {
				enabled: true,
				type: 'module',
			},
			filename: 'sw.ts',
			manifest: {
				description: 'We help you hunt for success!',
				icons: [
					{
						sizes: '192x192',
						src: '/public/android-chrome-192x192.png',
						type: 'image/png',
					},
					{
						sizes: '512x512',
						src: '/public/android-chrome-512x512.png',
						type: 'image/png',
					},
				],
				name: 'iHunt',
				orientation: 'portrait-primary',
				screenshots: [
					{
						sizes: '712x1284',
						src: '/public/screenshot.png',
					},
					{
						form_factor: 'wide',
						sizes: '712x1284',
						src: '/public/screenshot.png',
					},
				],
				short_name: 'iHunt',
				theme_color: 'oklch(51.4% 0.222 16.935)',
			},
			registerType: 'autoUpdate',
			scope: '/',
			srcDir: 'workers',
			strategies: 'injectManifest',
		}),
		process.env.ANALYZE_BUNDLE === '1' && (visualizer() as PluginOption),
	],
	publicDir: resolve(__dirname, 'public'),
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
		allowedHosts: true, // Unsafe, but this only runs in dev anyway.
		strictPort: true,
	},
});
