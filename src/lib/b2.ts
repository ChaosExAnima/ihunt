import { createHash } from 'node:crypto';
import { z } from 'zod';

import config from './config';

class B2 {
	protected API_PATH = 'b2api/v3';
	protected AUTH_URL =
		'https://api.backblazeb2.com/b2api/v2/b2_authorize_account';
	private apiRoot = '';
	private authToken = '';
	private bucketId = '';

	public async upload(
		file: Uint8Array<ArrayBufferLike>,
		fileName: string,
		fileType = 'b2/z-auto',
	) {
		await this.authorize();
		const { authorizationToken, uploadUrl } = await this.fetchWithSchema(
			`${this.apiRoot}/${this.API_PATH}/b2_get_upload_url?bucketId=${this.bucketId}`,
			{
				schema: z.object({
					authorizationToken: z.string(),
					bucketId: z.string(),
					uploadUrl: z.string(),
				}),
			},
		);
		const hash = createHash('sha1');
		hash.update(Buffer.from(file));

		const { action } = await this.fetchWithSchema(uploadUrl, {
			body: file,
			headers: {
				Authorization: authorizationToken,
				'Content-Length': `${file.byteLength}`,
				'Content-Type': fileType,
				'X-Bz-Content-Sha1': hash.digest('hex'),
				'X-Bz-File-Name': fileName,
			},
			method: 'POST',
			schema: z.object({
				action: z.string(),
			}),
		});
		if (action !== 'upload') {
			throw new Error(`Unexpected action from upload: ${action}`);
		}
	}

	protected async authorize() {
		if (this.authToken && this.apiRoot) {
			return;
		}
		const { backblazeId, backblazeKey } = config();
		const authCode = Buffer.from(`${backblazeId}:${backblazeKey}`).toString(
			'base64',
		);
		const response = await this.fetchWithSchema(this.AUTH_URL, {
			headers: {
				Authorization: `Basic ${authCode}`,
			},
			schema: z.object({
				allowed: z.object({
					bucketId: z.string(),
					bucketName: z.string(),
				}),
				apiUrl: z.string().url(),
				authorizationToken: z.string(),
			}),
		});
		this.authToken = response.authorizationToken;
		this.apiRoot = response.apiUrl;
		this.bucketId = response.allowed.bucketId;
	}

	protected async fetchWithSchema<Schema extends z.ZodSchema>(
		url: string | URL,
		options: RequestInit & { schema: Schema },
	): Promise<z.infer<Schema>>;
	protected async fetchWithSchema(
		url: string | URL,
		options?: RequestInit,
	): Promise<unknown>;
	protected async fetchWithSchema<Schema extends z.ZodSchema>(
		url: string | URL,
		options: RequestInit & { schema?: Schema } = {},
	) {
		if (this.authToken) {
			options.headers = {
				Authorization: this.authToken,
				...options.headers,
			};
		}
		const response = await fetch(url, options);
		if (!response.ok) {
			throw new Error(`Got response for ${url}: ${response.status}`);
		}
		if (!options.schema) {
			return response.json();
		}
		const body = await response.json();
		return options.schema.parseAsync(body);
	}
}

const globalForB2 = global as unknown as { b2: B2 };

export const b2 = globalForB2.b2 || new B2();

if (process.env.NODE_ENV !== 'production') globalForB2.b2 = b2;
