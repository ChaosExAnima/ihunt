import type { Options as PhotoUrlOptions } from '@imgproxy/imgproxy-js-core';

import { generateImageUrl } from '@imgproxy/imgproxy-node';
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';

import { omit } from '@/lib/utils';

import { config } from './config';
import { db, Photo } from './db';

type PhotoUrlArgs = PhotoUrlOptions & {
	path: string;
};

interface UploadPhotoArgs {
	buffer: Uint8Array;
	hunterId?: null | number;
	huntId?: null | number;
	name?: string;
}

export async function generateThumbhash(fullImage: sharp.Sharp) {
	const image = fullImage.resize(100, 100, { fit: 'inside' });
	const { data, info } = await image
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });
	const thumbhash = rgbaToThumbHash(info.width, info.height, data);
	return Buffer.from(thumbhash).toString('base64');
}

export function outputPhoto({
	height: targetHeight = 0,
	photo,
	width: targetWidth = 0,
	...options
}: PhotoUrlOptions & {
	photo: Photo;
}) {
	const actualHeight = Math.min(targetHeight, photo.height);
	const actualWidth = Math.min(targetWidth, photo.width);
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
		endpoint: `http${config.mediaSecure ? 's' : ''}://${config.mediaHost}`,
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
	// Check file type
	const image = sharp(buffer, { autoOrient: true });
	const metadata = await image.metadata();

	// Hash buffer for the filename
	const hash = createHash('sha256');
	hash.update(buffer);
	const hex = hash.digest('hex');
	const fileName = `${hex}.${metadata.format}`;

	const controller = new AbortController();
	try {
		const { mediaPath } = config;
		await writeFile(resolve(process.cwd(), mediaPath, fileName), buffer, {
			signal: controller.signal,
		});
	} catch (err) {
		controller.abort();
		throw new Error('Error with saving', { cause: err });
	}

	const blurry = await generateThumbhash(image);

	const { height, width } = metadata.autoOrient;

	return db.photo.create({
		data: {
			blurry,
			height,
			hunterId,
			huntId,
			path: fileName,
			width,
		},
	});
}
