'use server';

import B2 from 'backblaze-b2';
import { fileTypeFromBuffer } from 'file-type';
import { imageDimensionsFromData } from 'image-dimensions';
import { createHash } from 'node:crypto';
import z from 'zod';

import { db } from './db';
import { fetchBlurry } from './image-loader';

const b2UploadUrlResponse = z.object({
	authorizationToken: z.string(),
	bucketId: z.string(),
	uploadUrl: z.string(),
});

const b2UploadResponse = z.object({
	fileName: z.string(),
});

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

	// Hash buffer
	const hash = createHash('sha256');
	hash.update(arrayBuffer);
	const hex = hash.digest('hex');

	// Send it to B2
	const b2 = new B2({
		applicationKey: process.env.BACKBLAZE_BUCKET ?? '',
		applicationKeyId: process.env.BACKBLAZE_KEY ?? '',
	});
	await b2.authorize();

	const { data: urlData } = await b2.getUploadUrl({
		bucketId: process.env.BACKBLAZE_BUCKET ?? '',
	});

	const { authorizationToken, uploadUrl } =
		b2UploadUrlResponse.parse(urlData);

	const { data } = await b2.uploadFile({
		data: arrayBuffer,
		fileName: `${hex}.${fileType.ext}`,
		uploadAuthToken: authorizationToken,
		uploadUrl: uploadUrl,
	});
	const { fileName } = b2UploadResponse.parse(data); // Use B2 file name

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
