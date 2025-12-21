import fs from 'node:fs/promises';
import { basename } from 'node:path';
import { parseArgs } from 'node:util';

import { uploadPhoto } from '@/server/photo';

async function main() {
	const { positionals, values } = parseArgs({
		allowPositionals: true,
		options: {
			hunt: {
				type: 'string',
			},
			hunter: {
				type: 'string',
			},
		},
	});
	if (positionals.length === 0) {
		console.error('No photos provided');
		return;
	}

	const huntId = values.hunt ? parseInt(values.hunt) : undefined;
	const hunterId = values.hunter ? parseInt(values.hunter) : undefined;

	await Promise.all(positionals.map((p) => upload(p, huntId, hunterId)));
}

async function upload(file: string, huntId?: number, hunterId?: number) {
	const buffer = await fs.readFile(file);
	const photo = await uploadPhoto({
		buffer,
		hunterId,
		huntId,
	});
	console.log(`Uploaded ${basename(file)} as ${photo.id}`);
}

main().catch(console.error);
