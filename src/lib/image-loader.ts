import type { ImageLoaderProps } from 'next/image';

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
	return `https://${process.env.NEXT_PUBLIC_IMAGE_HOST}/cdn-cgi/image/${params.join(',')}/${src}`;
}
