import { fileTypeFromBuffer } from 'file-type';
import { imageDimensionsFromData } from 'image-dimensions';
import { createHash } from 'node:crypto';

import { fetchBlurry } from '@/lib/images';

import { db } from './db';

interface UploadPhotoArgs {
	buffer: Uint8Array;
	hunterId?: null | number;
	huntId?: null | number;
	name?: string;
}

export async function uploadPhoto({
	buffer,
	hunterId,
	huntId,
	name,
}: UploadPhotoArgs) {
	// Web buffer to Node buffer
	const arrayBuffer = Buffer.from(buffer);

	// Check file type
	const fileType = await fileTypeFromBuffer(arrayBuffer);
	if (!fileType) {
		throw new Error('Could not validate file type');
	}
	if (!fileType.mime.startsWith('image/')) {
		throw new Error(`Invalid mime type: ${fileType.mime}`);
	}

	// Get image dimensions
	const dimensions = imageDimensionsFromData(buffer);
	if (!dimensions) {
		throw new Error('Could not extract dimensions');
	}

	// Hash buffer for the filename
	let fileName = name;
	if (!fileName) {
		const hash = createHash('sha256');
		hash.update(arrayBuffer);
		const hex = hash.digest('hex');
		fileName = `${hex}.${fileType.ext}`;
	}

	// Send it to B2
	// await b2.upload(buffer, fileName, fileType.mime);

	// Fetch blurry version using Cloudflare image transforms
	let blurryData: null | string = null;
	try {
		blurryData = await fetchBlurry(fileName);
	} catch (err) {
		console.warn(err);
	}
	return db.photo.create({
		data: {
			...dimensions,
			blurry: blurryData,
			hunterId,
			huntId,
			path: fileName,
		},
	});
}
