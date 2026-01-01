/// <reference types="vite/client" />

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
	readonly VITE_VAPID_PUB_KEY: string;
}

interface ViteTypeOptions {
	strictImportMetaEnv: unknown;
}

declare module '@fastify/vite/plugin' {
	export function viteFastify(options?: {
		clientModule?: string;
		spa?: boolean;
		useRelativePaths?: boolean;
	}): Plugin;
	export default viteFastify;
}
