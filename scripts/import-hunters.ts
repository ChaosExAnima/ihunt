import { parse } from 'csv-parse';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { finished } from 'node:stream/promises';
import { parseArgs } from 'node:util';
import z from 'zod';

import { ACCESS_CODE_REGEX, HuntStatus } from '@/lib/constants';
import { extractKey, entitiesToIdMap } from '@/lib/utils';
import { db, Prisma } from '@/server/lib/db';
import { InviteStatus } from '@/server/lib/schema';

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
		await processHunters(rows);
	}
}

const hunterSchema = z.object({
	name: z.string(),
	handle: z.string(),
	pronouns: z.string().nullish(),
	type: z
		.string()
		.toLowerCase()
		.transform((type) => (type === '66' ? '66er' : type)),
	rating: z.coerce.number().positive().max(5),
	code: z.string().regex(ACCESS_CODE_REGEX).toLowerCase(),
	groupName: z.string().transform((name) => name || null),
	reviews: z
		.string()
		.array()
		.transform((reviews) => reviews.filter(Boolean)),
});
type CSVHunterSchema = z.infer<typeof hunterSchema>;

async function processFile(path: string) {
	const absPath = resolve(path);
	const rows: CSVHunterSchema[] = [];
	const parser = createReadStream(absPath).pipe(
		parse({
			trim: true,
			columns: [
				'code',
				'handle',
				'name',
				'pronouns',
				'type',
				'rating',
				'groupName',
				'reviews',
				'reviews',
			],
			from: 2,
			groupColumnsByName: true,
			skipEmptyLines: true,
		}),
	);
	parser.on('readable', () => {
		let row;
		while ((row = parser.read()) !== null) {
			rows.push(hunterSchema.parse(row));
		}
	});
	await finished(parser);

	return {
		path,
		rows,
	};
}

async function processHunters(rows: CSVHunterSchema[]) {
	const groupNames = new Set<string>();
	const hunterObjects = rows.map(parseHunterRow);

	// Groups
	hunterObjects.forEach(({ groupName }) => {
		if (groupName?.trim()) {
			groupNames.add(groupName.trim());
		}
	});

	const groups = await db.hunterGroup.createManyAndReturn({
		data: Array.from(groupNames).map((name) => ({
			name,
		})),
	});
	const groupNameMap = entitiesToIdMap(groups, 'name');
	console.log('Created', groups.length, 'hunter groups:', groupNames);

	// Users
	const users = await db.user.createManyAndReturn({
		data: hunterObjects
			.filter(({ code }) => !!code)
			.map(({ code }) => ({ code, run: 1 })),
	});
	const userCodeMap = entitiesToIdMap(users, 'code');
	console.log('Created', users.length, 'users');

	// Hunters
	const hunters = await db.hunter.createManyAndReturn({
		data: hunterObjects.map(({ code, create, groupName }) => ({
			...create,
			groupId: groupName ? groupNameMap.get(groupName) : null,
			userId: userCodeMap.get(code),
		})),
	});
	const hunterHandleMap = entitiesToIdMap(hunters, 'handle');
	console.log(
		'Created',
		hunters.length,
		'hunters:',
		extractKey(hunters, 'handle'),
	);

	// Hunt reviews
	for (const {
		create: { handle },
		reviews,
	} of hunterObjects) {
		const hunterId = hunterHandleMap.get(handle);
		if (!hunterId) {
			console.warn('Could not get id of handle', handle);
			continue;
		}

		const hunts = await db.hunt.createManyAndReturn({
			data: reviews,
		});
		await db.huntHunter.createMany({
			data: hunts.map(({ id }) => ({
				hunterId,
				huntId: id,
				status: InviteStatus.Accepted,
				paid: 0,
			})),
		});

		console.log('Created', hunts.length, 'hunts for hunter', handle);
	}
}

function parseHunterRow(row: CSVHunterSchema) {
	const { code, groupName, reviews, ...shape } = row;
	console.log('Got hunter', shape.name, `(${shape.handle})`);

	return {
		code:
			code && !code.startsWith('n') && !code.startsWith('d')
				? code
				: null,
		create: {
			...shape,
			alive: !!code && !code.startsWith('d'),
		} satisfies Prisma.HunterCreateInput,
		groupName,
		reviews: reviews.map(
			(comment, index) =>
				({
					name: `${shape.handle} review`,
					description: `Review ${index + 1} for ${shape.handle}`,
					payment: 0,
					comment,
					status: HuntStatus.Complete,
					rating: shape.rating,
				}) satisfies Prisma.HuntCreateInput,
		),
	};
}

main()
	.then(() => process.exit())
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
