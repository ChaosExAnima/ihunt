import type { ImageLoaderProps } from 'next/image';

import { publicConfig } from './config';

// Docs: https://developers.cloudflare.com/images/transform-images
export default function cloudflareLoader({
	format = 'auto',
	quality,
	src,
	width,
}: { format?: string } & ImageLoaderProps) {
	const params = [
		`width=${width}`,
		`quality=${quality || 75}`,
		`format=${format}`,
	];
	const { imageHost } = publicConfig;
	return `https://${imageHost}/cdn-cgi/image/${params.join(',')}/${src}`;
}

export async function fetchBlurry(src: string) {
	const url = cloudflareLoader({
		format: 'jpeg',
		src,
		width: 10,
	});
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(
			`Error from CloudFlare: ${response.status} ${await response.text()}`,
		);
	}
	const bytes = await response.arrayBuffer();
	const buffer = Buffer.from(bytes);
	const base64 = buffer.toString('base64');
	return base64;
}
