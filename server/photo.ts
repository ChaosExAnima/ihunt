import {
	generateUrl,
	Options as PhotoUrlOptions,
} from '@imgproxy/imgproxy-js-core';
import { Photo } from '@prisma/client';
import { fileTypeFromBuffer } from 'file-type';
import { writeFile } from 'fs/promises';
import { imageDimensionsFromData } from 'image-dimensions';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

import { fetchBlurry } from '@/lib/images';
import { PhotoSchema } from '@/lib/schemas';

import { config } from './config';
import { db } from './db';

type AddUrlToPhotoArgs = {
	photo: null | Photo;
};

type PhotoUrlArgs = PhotoUrlOptions & {
	path: string;
};

interface UploadPhotoArgs {
	buffer: Uint8Array;
	hunterId?: null | number;
	huntId?: null | number;
	name?: string;
}

export function addUrlToPhoto(
	args: PhotoUrlOptions & Required<AddUrlToPhotoArgs>,
): PhotoSchema;
export function addUrlToPhoto(args: PhotoUrlOptions & { photo: null }): null;
export function addUrlToPhoto({
	photo,
	...options
}: AddUrlToPhotoArgs & PhotoUrlOptions): null | PhotoSchema {
	if (!photo) {
		return null;
	}
	return {
		...photo,
		url: photoUrl({
			...options,
			height: options.height ?? photo.height,
			path: photo.path,
			width: options.width ?? photo.width,
		}),
	};
}

export function photoUrl({ path, ...options }: PhotoUrlArgs) {
	const fullSrc = new URL(path, config.mediaHost).toString();
	const escapedSrc = fullSrc
		.replace('%', '%25')
		.replace('?', '%3F')
		.replace('@', '%40');

	const url = generateUrl({ type: 'plain', value: escapedSrc }, options);
	return url;
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
