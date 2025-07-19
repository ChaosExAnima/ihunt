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
	const body = (await response.json()) as unknown;
	if (schema) {
		try {
			return schema.parse(body);
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
	return body as Data;
}

export async function parseRequestBody<Data>(
	req: Request,
	schema: z.ZodSchema<Data>,
): Promise<Data> {
	const body = (await req.json()) as unknown;
	return schema.parse(body);
}

export function returnError(
	message: string = 'An error occurred',
	status: number = 500,
) {
	return Response.json(
		{
			message,
			status,
			success: false,
		},
		{ status },
	);
}
