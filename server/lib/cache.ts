import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';
import superjson from 'superjson';
import z from 'zod';

import { isDev } from '@/lib/utils';

import { config } from './config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Use any as a default.
let store: KeyvRedis<any> | Map<string, any> = new Map();
if (config.redisUrl) {
	console.log('Using Redis at', config.redisUrl);
	store = new KeyvRedis(`redis://${config.redisUrl}`);
}

export const keyval = new Keyv({
	deserialize: superjson.parse,
	namespace: isDev() ? 'ihunt-dev' : 'ihunt',
	serialize: superjson.stringify,
	store,
});

export function cacheIterator<TValue>(key: string) {
	if (!keyval.iterator) {
		throw new Error('Cache backend does not support iterators');
	}

	return keyval.iterator(key) as AsyncGenerator<[string, TValue], void>;
}

export function getCached<TSchema extends z.ZodType>(
	key: string,
	schema: TSchema,
) {
	return schema.parseAsync(keyval.get(key));
}
