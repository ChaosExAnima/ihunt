import { parseArgs } from 'node:util';

import { passwordToHash, stringToPassword } from '@/server/auth';

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
		const newPassword = stringToPassword(hunter.handle);
		const hashedPassword = await passwordToHash(newPassword);
		if (user.password !== hashedPassword) {
			await db.user.update({
				data: { password: hashedPassword },
				where: { id: user.id },
			});
			console.log(
				`Reset password for user ${user.id} from hunter ${hunter.handle}`,
			);
		}
	}
}

main().catch(console.error);
