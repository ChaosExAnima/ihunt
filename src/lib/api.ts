import { z } from 'zod';

import { isPlainObject } from './utils';

interface FetchOptions extends Omit<RequestInit, 'body'> {
	body?: BodyInit | null | object;
}

export async function fetchFromApi<Data>(
	path: string,
	opts: FetchOptions = {},
	schema?: z.ZodSchema<Data>,
): Promise<Data> {
	if (isPlainObject(opts.body)) {
		opts.body = JSON.stringify(opts.body);
		opts.headers = {
			...opts.headers,
			'Content-Type': 'application/json',
		};
	}
	const response = await fetch(path, opts as RequestInit);
	if (!response.ok) {
		throw new Error(`Could not fetch ${path}`);
	}
	const body = await response.json();
	if (schema) {
		return schema.parseAsync(body);
	}
	return body as Data;
}

export async function parseRequestBody<Data>(
	req: Request,
	schema: z.ZodSchema<Data>,
): Promise<Data> {
	const body = await req.json();
	return schema.parse(body);
}

export const fetchFn = async <Data>(
	...args: Parameters<typeof fetchFromApi<Data>>
) => {
	return () => fetchFromApi<Data>(...args);
};

export const idSchema = z.number().int().positive().min(1);
export const idSchemaCoerce = z.preprocess(
	(arg) => (typeof arg === 'string' ? Number.parseInt(arg) : arg),
	idSchema,
);
