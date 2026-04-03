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

interface RequestInit {
	targetAddressSpace?: 'local';
}

interface Window {
	__IHUNT_VERSION__?: string;
}

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
