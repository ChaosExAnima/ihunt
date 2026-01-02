import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';
import superjson from 'superjson';
import z from 'zod';

import { isDev } from '@/lib/utils';

import { config } from './config';

// TODO: Switch to node-redis directly.

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Use any as a default.
let store: KeyvRedis<any> | null = null;
if (config.redisUrl) {
	store = new KeyvRedis(`redis://${config.redisUrl}`, {
		keyPrefixSeparator: ':',
	});
}

const namespace = isDev() ? 'ihunt-dev' : 'ihunt';

export const keyval = new Keyv({
	deserialize: superjson.parse,
	namespace,
	serialize: superjson.stringify,
	store: store ?? new Map(),
	useKeyPrefix: false,
});

export async function* cacheIterator<TValue>(
	keyPrefix: string,
): AsyncGenerator<[string, TValue], void> {
	// KeyV's iterator function, despite the arg, doesn't actually filter by prefix.
	// See: https://github.com/jaredwray/keyv/issues/1289
	const iterator = store?.iterator?.bind(store) ?? keyval.iterator;
	if (!iterator) {
		throw new Error('Cache backend does not support iterators');
	}

	// We need to insert the namespace manually if we're directly using the store.
	const nsKeyPrefix = store ? `${namespace}:${keyPrefix}` : {};
	for await (const [key, value] of iterator<TValue>(
		nsKeyPrefix,
	) as AsyncGenerator<[string, TValue], void>) {
		// If we're using the store directly, we need to manually deserialize.
		if (store) {
			const data = await keyval.deserializeData<TValue>(value as string);
			if (data?.value) {
				// Keys obtained using scan need to be prefixed again.
				yield [`${keyPrefix}:${key}`, data.value];
			}
		}

		// If we're using a map, just check the key is prefixed correctly.
		if (key.startsWith(keyPrefix)) {
			yield [key, value];
		}
	}
}

export function getCached<TSchema extends z.ZodType>(
	key: string,
	schema: TSchema,
) {
	return schema.parseAsync(keyval.get(key));
}
