import type { Options as PhotoUrlOptions } from '@imgproxy/imgproxy-js-core';

import { generateImageUrl } from '@imgproxy/imgproxy-node';
import { Photo } from '@prisma/client';
import { fileTypeFromBuffer } from 'file-type';
import { writeFile } from 'fs/promises';
import { imageDimensionsFromData } from 'image-dimensions';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

import { fetchBlurry } from '@/lib/images';
import { omit } from '@/lib/utils';

import { config } from './config';
import { db } from './db';

type PhotoUrlArgs = PhotoUrlOptions & {
	path: string;
};

interface UploadPhotoArgs {
	buffer: Uint8Array;
	hunterId?: null | number;
	huntId?: null | number;
	name?: string;
}

export function outputPhoto({
	height: targetHeight,
	photo,
	width: targetWidth,
	...options
}: PhotoUrlOptions & {
	photo: Photo;
}) {
	const actualHeight =
		targetHeight && targetHeight < photo.height
			? targetHeight
			: photo.height;
	const actualWidth =
		targetWidth && targetWidth < photo.width ? targetWidth : photo.width;
	return {
		...omit(photo, 'huntId', 'hunterId', 'path'),
		height: actualHeight,
		url: photoUrl({
			...options,
			height: actualHeight,
			path: photo.path,
			width: actualWidth,
		}),
		width: actualWidth,
	};
}

export function photoUrl({ path, ...options }: PhotoUrlArgs) {
	const url = generateImageUrl({
		endpoint: 'https://images.ihunt.local',
		options,
		url: `local:///${path}`,
	});
	return url;
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
	if (!fileType.mime.startsWith('image/')) {
		throw new Error(`Invalid mime type: ${fileType.mime}`);
	}

	// Get image dimensions
	const dimensions = imageDimensionsFromData(buffer);
	if (!dimensions) {
		throw new Error('Could not extract dimensions');
	}

	// Hash buffer for the filename
	const hash = createHash('sha256');
	hash.update(arrayBuffer);
	const hex = hash.digest('hex');
	const fileName = `${hex}.${fileType.ext}`;

	const controller = new AbortController();
	try {
		const { mediaPath } = config;
		await writeFile(resolve(process.cwd(), mediaPath, fileName), buffer, {
			signal: controller.signal,
		});
	} catch (err) {
		controller.abort();
		throw new Error('Error with upload', { cause: err });
	}

	// Fetch blurry version
	let blurryData: null | string = null;
	try {
		blurryData = await fetchBlurry(fileName);
	} catch (err) {
		console.warn(err);
	}
	const { height, width } = dimensions;
	return db.photo.create({
		data: {
			blurry: blurryData,
			height,
			hunterId,
			huntId,
			path: fileName,
			width,
		},
	});
}
