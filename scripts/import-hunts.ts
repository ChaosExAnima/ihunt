import { parse } from 'csv-parse';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { finished } from 'node:stream/promises';
import { parseArgs } from 'node:util';
import z from 'zod';

import { HuntStatus } from '@/lib/constants';
import { db, Prisma } from '@/server/lib/db';

async function main() {
	const { positionals } = parseArgs({
		allowPositionals: true,
	});

	const files = await Promise.all(positionals.map(processFile));
	if (files.length === 0) {
		throw new Error('No CSV files imported');
	}

	for (const file of files) {
		const { rows } = file;

		await processHunts(rows);
	}
}

const huntSchema = z.object({
	name: z.string(),
	danger: z.coerce.number().int().min(1).max(5),
	payment: z.string().transform((input) =>
		z.coerce
			.number()
			.int()
			.nonnegative()
			.parse(input.replaceAll(/[^\d]*/g, '')),
	),
	location: z.string(),
	description: z.string(),
	triggers: z.string().nullish(),
	time: z.string().nullish(),
	picture: z
		.string()
		.transform((input) => (input ? z.url().parse(input) : null)),
});
type CSVHuntSchema = z.infer<typeof huntSchema>;

async function processHunts(rows: CSVHuntSchema[]) {
	const hunts = await db.hunt.createManyAndReturn({
		data: rows.map(
			({ picture, triggers, time, location, ...row }) =>
				({
					warnings: triggers,
					place: location,
					...row,
					status: HuntStatus.Pending,
				}) satisfies Prisma.HuntCreateInput,
		),
	});

	// TODO: Import photo

	console.log('Created', hunts.length, 'hunts');
}

async function processFile(path: string) {
	const absPath = resolve(path);
	const rows: CSVHuntSchema[] = [];
	const parser = createReadStream(absPath).pipe(
		parse({
			trim: true,
			columns: [
				'name',
				'danger',
				'payment',
				'location',
				'client',
				'description',
				'triggers',
				'time',
				'picture',
			],
			from: 2,
			skipEmptyLines: true,
		}),
	);
	parser.on('readable', () => {
		let row;
		while ((row = parser.read()) !== null) {
			rows.push(huntSchema.parse(row));
		}
	});
	await finished(parser);

	return {
		path,
		rows,
	};
}

main()
	.then(() => process.exit())
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
