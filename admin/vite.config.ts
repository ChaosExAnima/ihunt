import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

const clientDir = resolve(import.meta.dirname, '../client');

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		base: '/admin/',
		publicDir: resolve(clientDir, 'public'),
		root: import.meta.dirname,
		build: {
			outDir: resolve(import.meta.dirname, 'dist'),
			emptyOutDir: true,
		},

		server: {
			host: '0.0.0.0',
			allowedHosts: true, // Unsafe, but this only runs in dev anyway.
			port: 5174,
			strictPort: true,
			proxy: {
				'/trpc': `http://localhost:${env.PORT ?? 4000}`,
				'/images': 'http://localhost:9000',
			},
		},

		resolve: {
			alias: [
				{ find: '@ihunt/client', replacement: clientDir },
				{ find: '@', replacement: clientDir },
			],
		},

		plugins: [tailwindcss(), react()],
	};
});
