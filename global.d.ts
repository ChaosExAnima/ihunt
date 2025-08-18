/// <reference types="vite/client" />

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
	readonly VITE_IMAGE_HOST: string;
}

interface ViteTypeOptions {
	strictImportMetaEnv: unknown;
}

declare module '@fastify/vite/plugin' {
	export function viteFastify(options?: {
		clientModule?: string;
		spa?: boolean;
	}): Plugin;
	export default viteFastify;
}
