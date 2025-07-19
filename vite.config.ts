import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	root: 'client',
  plugins: [
	tanstackRouter({
		autoCodeSplitting: true,
		target: 'react',
		routesDirectory: 'client/routes',
		generatedRouteTree: 'client/routeTree.gen.ts'
	}),
    react(),
  ],
});
