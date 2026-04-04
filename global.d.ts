/// <reference types="vite/client" />

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface ViteTypeOptions {
	strictImportMetaEnv: unknown;
}

interface RequestInit {
	targetAddressSpace?: 'local';
}

interface Window {
	readonly __IHUNT_VERSION__?: string;
}

declare const __VAPID_KEY__: string;

declare module '@fastify/vite/plugin' {
	export function viteFastify(options?: {
		clientModule?: string;
		spa?: boolean;
		useRelativePaths?: boolean;
	}): Plugin;
	export default viteFastify;
}

declare module '*.css';
declare module '@fontsource/*' {}
declare module '@fontsource-variable/*' {}
