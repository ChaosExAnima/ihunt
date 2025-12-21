import type { Options as PhotoUrlOptions } from '@imgproxy/imgproxy-js-core';

import { generateImageUrl } from '@imgproxy/imgproxy-node';
import { Photo } from '@prisma/client';
import { fileTypeFromBuffer } from 'file-type';
import { writeFile } from 'fs/promises';
import { imageDimensionsFromData } from 'image-dimensions';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import z from 'zod';

import { fetchBlurry } from '@/lib/images';
import { idSchema, photoSchema } from '@/lib/schemas';
import { isPlainObject, omit } from '@/lib/utils';

import { config } from './config';
import { db } from './db';

export type OutputPhoto = z.infer<typeof photoSchema>;

type PhotoUrlArgs = PhotoUrlOptions & {
	path: string;
};

interface UploadPhotoArgs {
	buffer: Uint8Array;
	hunterId?: null | number;
	huntId?: null | number;
	name?: string;
}

const photoDbSchema = photoSchema.omit({ url: true }).merge(
	z.object({
		hunterId: idSchema.nullable(),
		huntId: idSchema.nullable(),
		id: idSchema,
		path: z.string(),
	}),
);

export function outputPhoto({
	height: targetHeight,
	photo,
	width: targetWidth,
}: {
	height?: number;
	photo: Photo;
	width?: number;
}) {
	const actualHeight =
		targetHeight && targetHeight < photo.height
			? targetHeight
			: photo.height;
	const actualWidth =
		targetWidth && targetWidth < photo.width ? targetWidth : photo.width;
	return {
		...omit(photo, 'huntId', 'hunterId', 'path'),
		url: photoUrl({
			height: actualHeight,
			path: photo.path,
			width: actualWidth,
		}),
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

export function recursivelyReplacePhotos(input: unknown): unknown {
	if (Array.isArray(input)) {
		return input.map(recursivelyReplacePhotos);
	}

	if (!isPlainObject(input)) {
		return input;
	}

	const schema = z
		.object({ photos: z.array(photoDbSchema) })
		.or(z.object({ avatar: photoDbSchema }));
	const parsed = schema.safeParse(input);
	if (!parsed.success) {
		return Object.fromEntries(
			Object.entries(input).map(
				([key, value]: [string, unknown]): [string, unknown] => {
					if (!isPlainObject(value)) {
						return [key, value];
					}
					return [key, recursivelyReplacePhotos(value)];
				},
			),
		);
	}
	const data = parsed.data;

	if ('photos' in data) {
		return {
			...input,
			photos: data.photos.map((photo) => outputPhoto({ photo })),
		};
	} else {
		return {
			...input,
			avatar: outputPhoto({ photo: data.avatar }),
		};
	}
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
