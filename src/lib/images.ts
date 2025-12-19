interface ImageLoaderArgs {
	format?: string;
	quality?: number;
	src: string;
	width: number;
}

export function cloudflareLoader({
	format = 'auto',
	quality = 75,
	src,
	width,
}: ImageLoaderArgs) {
	const params = [`width=${width}`, `quality=${quality}`, `format=${format}`];
	const imageHost = import.meta.env.VITE_IMAGE_HOST;
	return `https://${imageHost}/cdn-cgi/image/${encodeURIComponent(params.join(','))}/${src}`;
}

export async function fetchBlurry(url: string) {
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
