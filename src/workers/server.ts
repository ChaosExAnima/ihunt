/// <reference lib="WebWorker" />
/// <reference types="vite/client" />

import { RouteHandlerCallbackOptions } from 'workbox-core';
import z from 'zod';

import { MINUTE, SECOND } from '@/lib/formats';

declare const self: ServiceWorkerGlobalScope;

const apiSchema = z.object({
	result: z.object({
		data: z.object({
			json: z.object({
				message: z.string(),
				status: z.literal('ok'),
				servers: z.url().array(),
			}),
		}),
	}),
});

export class WorkerServer {
	private abortController = new AbortController();
	private currentServer?: string;
	private servers: string[] = [
		`${self.location.protocol}//${self.location.host}`,
	];
	private delay = 5 * SECOND;
	private timerId = -1;

	constructor() {
		void this.update();
	}

	async checkServer(host: string) {
		try {
			const url = new URL(host);
			const response = await fetch(new URL('/trpc/api.hello', url), {
				signal: this.abortController.signal,
			});
			if (!response.ok) {
				throw Error('Heartbeat not okay');
			}
			const body = await response.json();
			const parsed = apiSchema.parse(body);

			const oldServers = this.servers.length;
			for (const server of parsed.result.data.json.servers) {
				if (!this.servers.includes(server)) {
					this.servers.push(server);
				}
			}
			if (this.servers.length !== oldServers) {
				console.log('Servers are now:', this.servers.join(', '));
			}
			return true;
		} catch (err: unknown) {
			console.log('server response err:', err, host);
			return false;
		}
	}

	async routeCallback(
		options: RouteHandlerCallbackOptions,
	): Promise<Response> {
		const { request, url } = options;
		if (this.currentServer && url.host !== this.currentServer) {
			const newUrl = new URL(url);
			newUrl.host = new URL(this.currentServer).host;
			try {
				const response = await fetch(newUrl, {
					...request,
					credentials: 'include',
				});
				return response;
			} catch (err: unknown) {
				console.warn('error with request:', err, newUrl);
			}
		}
		return await fetch(request);
	}

	async update() {
		for (const host of this.servers.toReversed()) {
			const isAvailable = await this.checkServer(host);
			if (isAvailable) {
				if (host !== this.currentServer) {
					this.currentServer = host;
				} else {
					this.delay = Math.min(this.delay * 5, MINUTE);
				}
				break;
			}
		}
		if (this.timerId) {
			clearTimeout(this.timerId);
		}
		this.timerId = self.setTimeout(this.update.bind(this), this.delay);
	}
}
