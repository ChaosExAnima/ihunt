import type { PixelCrop } from 'react-image-crop';

export function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((result, reject) => {
		const reader = new FileReader();
		reader.onload = () => result(reader.result as string);
		reader.onerror = () =>
			reject(reader.error ?? new Error('Unknown error'));
		reader.onabort = () => reject(new Error('Read aborted'));
		reader.readAsDataURL(blob);
	});
}
export async function imageToBlob(
	image: HTMLImageElement,
	crop: PixelCrop,
): Promise<Blob> {
	const scaleX = image.naturalWidth / image.width;
	const scaleY = image.naturalHeight / image.height;

	const offscreen = new OffscreenCanvas(
		crop.width * scaleX,
		crop.height * scaleY,
	);

	const ctx = offscreen.getContext('2d');
	if (!ctx) {
		throw new Error('No 2d context');
	}

	ctx.imageSmoothingQuality = 'high';

	// Save original state.
	ctx.save();

	// Move the crop origin to the canvas origin (0,0).
	const cropX = crop.x * scaleX;
	const cropY = crop.y * scaleY;
	ctx.translate(-cropX, -cropY);

	// Move the origin to the center of the original position.
	const centerX = image.naturalWidth / 2;
	const centerY = image.naturalHeight / 2;
	ctx.translate(centerX, centerY);
	ctx.translate(-centerX, -centerY);

	// Draw the image
	ctx.drawImage(
		image,
		0,
		0,
		image.naturalWidth,
		image.naturalHeight,
		0,
		0,
		image.naturalWidth,
		image.naturalHeight,
	);

	// Restore the original state.
	ctx.restore();

	return offscreen.convertToBlob({
		quality: 0.7,
		type: 'image/jpeg',
	});
}
