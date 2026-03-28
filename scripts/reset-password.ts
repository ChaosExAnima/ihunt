import { parseArgs } from 'node:util';

import { hunterTypeSchema } from '@/lib/schemas';
import { calculateNextAccessCode } from '@/server/lib/auth';
import { db } from '@/server/lib/db';

async function main() {
	const { positionals, values } = parseArgs({
		allowPositionals: true,
		options: {
			all: {
				type: 'boolean',
			},
		},
	});
	if (!values.all && positionals.length === 0) {
		console.log(
			'Reset password for user or all users.\n' +
				'tsx scripts/reset-passwords.ts <--all> [...ids]',
		);
		return;
	}
	const where = values.all
		? {}
		: {
				id: {
					in: positionals
						.map(Number.parseInt)
						.filter((num) => num > 0 && Number.isSafeInteger(num)),
				},
			};
	const users = await db.user.findMany({
		include: {
			hunter: true,
		},
		where,
	});

	for (const user of users) {
		const hunter = user.hunter;
		const type = hunter?.type;
		if (!type) {
			continue;
		}
		const newCode = await calculateNextAccessCode(
			hunterTypeSchema.parse(type),
		);
		await db.user.update({
			data: { code: newCode },
			where: { id: user.id },
		});
		console.log(
			`Reset password for user ${user.id} from hunter ${hunter.handle}`,
		);
	}
}

main().catch(console.error);
