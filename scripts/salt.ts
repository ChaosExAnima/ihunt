import { genSalt, hash } from 'bcryptjs';
import { parseArgs } from 'node:util';

import { HASH_ITERATIONS } from '@/server/lib/auth';

const {
	values: { password, plain },
} = parseArgs({
	options: {
		password: {
			type: 'string',
		},
		plain: {
			short: 'p',
			type: 'boolean',
		},
	},
});

let output = '';
if (password) {
	output = await hash(password, HASH_ITERATIONS);
} else {
	output = await genSalt(HASH_ITERATIONS);
}

if (plain) {
	console.log(output);
} else {
	console.log(`${password ? 'Password' : 'Salt'} is:\n${output}`);
}
