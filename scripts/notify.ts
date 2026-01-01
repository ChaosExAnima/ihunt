import { parseArgs } from 'node:util';
import z from 'zod';

import { idSchemaCoerce } from '@/lib/schemas';
import { notifyUser } from '@/server/lib/notify';

async function main() {
	const { positionals, values } = parseArgs({
		allowPositionals: true,
		options: {
			body: {
				type: 'string',
			},
			title: {
				type: 'string',
			},
		},
	});

	const { body, title } = values;
	if (!title) {
		throw new Error('Missing title');
	}

	let userIds: number[] = [];
	try {
		userIds = z.array(idSchemaCoerce).parse(positionals);
	} catch (err) {
		throw new Error('Invalid user IDs', { cause: err });
	}
	if (userIds.length === 0) {
		throw new Error('No valid user IDs');
	}

	let count = 0;
	for (const userId of userIds) {
		await notifyUser({ body, title, userId });
		count++;
	}

	console.log('sent', count, 'notifications');
}

main()
	.then(() => process.exit())
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
