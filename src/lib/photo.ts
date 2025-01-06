'use server';

import { fileTypeFromBuffer } from 'file-type';
import { imageDimensionsFromData } from 'image-dimensions';
import { createHash } from 'node:crypto';

import { b2 } from './b2';
import { db } from './db';
import { fetchBlurry } from './image-loader';

interface UploadPhotoArgs {
	buffer: Uint8Array;
	hunterId?: number;
	huntId?: number;
}

export async function uploadPhoto({
	buffer,
	hunterId,
	huntId,
}: UploadPhotoArgs) {
	// Web buffer to Node buffer
	const arrayBuffer = Buffer.from(buffer);

	// Check file type
	const fileType = await fileTypeFromBuffer(arrayBuffer);
	if (!fileType) {
		throw new Error('Could not validate file type');
	}

	// Get image dimensions
	const dimensions = await imageDimensionsFromData(buffer);
	if (!dimensions) {
		throw new Error('Could not extract dimensions');
	}

	// Hash buffer for the filename
	const hash = createHash('sha256');
	hash.update(arrayBuffer);
	const hex = hash.digest('hex');
	const fileName = `${hex}.${fileType.ext}`;

	// Send it to B2
	await b2.upload(buffer, fileName, fileType.mime);

	// Fetch blurry version using Cloudflare image transforms
	const blurryData = await fetchBlurry(fileName);
	await db.photo.create({
		data: {
			...dimensions,
			blurry: blurryData,
			hunterId,
			huntId,
			path: fileName,
		},
	});
}
