import { genSalt } from 'bcryptjs';
import { parseArgs } from 'node:util';

import { HASH_ITERATIONS } from '@/server/auth';

const {
	values: { plain },
} = parseArgs({
	options: {
		plain: {
			short: 'p',
			type: 'boolean',
		},
	},
});

const salt = await genSalt(HASH_ITERATIONS);
if (plain) {
	console.log(salt);
} else {
	console.log(`Salt is:\n${salt}`);
}
