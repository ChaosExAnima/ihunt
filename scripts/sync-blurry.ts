import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

import { config } from '@/server/lib/config';
import { db } from '@/server/lib/db';
import { generateThumbhash } from '@/server/lib/photo';

async function main() {
	const force = process.argv.includes('-f');

	const photos = await db.photo.findMany({
		where: !force
			? {
					blurry: null,
				}
			: {},
	});
	await Promise.all(
		photos.map(async (photo) => {
			try {
				const buffer = await readFile(
					resolve(config.uploadPath, photo.path),
				);
				const image = sharp(buffer);
				const blurry = await generateThumbhash(image);
				await db.photo.update({
					data: {
						blurry,
					},
					where: { id: photo.id },
				});
				console.log(`${photo.id}: Updated DB`);
			} catch (err) {
				console.warn(`Photo ${photo.id} failed:`, err);
			}
		}),
	);
}

void main();
