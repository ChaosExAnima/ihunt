import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
	tanstackRouter({
		autoCodeSplitting: true,
		target: 'react',
		routesDirectory: 'client/routes',
		generatedRouteTree: 'client/routeTree.gen.ts'
	}),
    react(),
  ],
  root: resolve(import.meta.dirname, 'client'),
});
