import { db } from '@/lib/db';
import cloudflareLoader from '@/lib/image-loader';

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
			const url = cloudflareLoader({
				format: 'jpeg',
				src: photo.path,
				width: 10,
			});
			console.log(`${photo.id}: Fetching URL ${url}`);
			const response = await fetch(url);
			if (!response.ok) {
				console.warn(`${photo.id}: Error ${response.status}`);
				return;
			}
			const bytes = await response.arrayBuffer();
			console.log(
				`${photo.id}: Got response of ${bytes.byteLength} bytes`,
			);
			const buffer = Buffer.from(bytes);
			const base64 = buffer.toString('base64');
			await db.photo.update({
				data: {
					blurry: base64,
				},
				where: { id: photo.id },
			});
			console.log(`${photo.id}: Updated DB`);
		}),
	);
}

main();
