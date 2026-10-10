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

declare module '*.css';
declare module '@fontsource/*' {}
declare module '@fontsource-variable/*' {}
