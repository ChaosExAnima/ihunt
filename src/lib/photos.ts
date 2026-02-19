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

export async function detectCameraCount() {
	const devices = await navigator.mediaDevices.enumerateDevices();
	return devices.filter(({ kind }) => kind === 'videoinput');
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

export async function saveVideoStill(videoEle: HTMLVideoElement) {
	videoEle.pause();

	const stream = videoEle.srcObject;
	if (!(stream instanceof MediaStream)) {
		throw new Error('No video stream');
	}
	let height: number | undefined, width: number | undefined;
	const track = stream.getVideoTracks().at(0);
	if (track) {
		const imageCapture = new ImageCapture(track);
		const capabilities = await imageCapture.getPhotoCapabilities();
		if (capabilities.imageHeight) {
			height = capabilities.imageHeight?.max;
		}
		if (capabilities.imageWidth) {
			width = capabilities.imageWidth?.max;
		}
	}

	if (!width || !height) {
		throw new Error('Invalid video size');
	}

	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Cannot save video');
	}
	ctx.imageSmoothingQuality = 'high';

	// Save original state.
	ctx.drawImage(videoEle, 0, 0, width, height, 0, 0, width, height);
	ctx.save();

	return canvas.convertToBlob({
		quality: 0.7,
		type: 'image/jpeg',
	});
}

export async function startCameraStream({
	useBack = false,
	videoEle,
}: {
	useBack?: boolean;
	videoEle: HTMLVideoElement;
}) {
	// Clean up old tracks.
	if (videoEle.srcObject instanceof MediaStream) {
		videoEle.srcObject.getTracks().forEach((track) => track.stop());
	}

	const stream = await navigator.mediaDevices.getUserMedia({
		audio: false,
		video: {
			facingMode: {
				ideal: useBack ? 'environment' : 'user',
			},
		},
	});

	videoEle.srcObject = stream;
}
