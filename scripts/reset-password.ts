import { parseArgs } from 'node:util';

import { PASSWORD_CHAR_COUNT } from '@/lib/constants';

import { db } from '../server';

async function main() {
	const { positionals, values } = parseArgs({
		allowPositionals: true,
		options: {
			all: {
				type: 'boolean',
			},
		},
	});
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
			hunters: {
				where: {
					alive: true,
				},
			},
		},
		where,
	});

	for (const user of users) {
		const hunter = user.hunters.at(0);
		if (!hunter) {
			continue;
		}
		const newPassword = hunter.handle.slice(0, PASSWORD_CHAR_COUNT);
		if (user.password !== newPassword) {
			await db.user.update({
				data: { password: newPassword },
				where: { id: user.id },
			});
			console.log(
				`Reset password for user ${user.id} from hunter ${hunter.handle}`,
			);
		}
	}
}

main().catch(console.error);
