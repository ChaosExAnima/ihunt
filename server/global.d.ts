declare module '@fastify/vite/plugin' {
	export function viteFastify(options?: {
		clientModule?: string;
		spa?: boolean;
		useRelativePaths?: boolean;
	}): Plugin;
	export default viteFastify;
}
