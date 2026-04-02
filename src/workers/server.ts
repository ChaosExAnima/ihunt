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
				publicHost: z.url(),
				lanHost: z.url().optional(),
			}),
		}),
	}),
});

export class WorkerServer {
	private abortController = new AbortController();
	private currentServer?: string;
	private publicServer = `${self.location.protocol}//${self.location.host}`;
	private lanServer?: string;
	private delay = 5 * SECOND;
	private timerId = -1;

	constructor() {
		void this.getServers();
	}

	async getServers() {
		console.log('checking servers...');

		const response = await this.checkServer(this.publicServer);
		if (response?.lanHost) {
			this.lanServer = response.lanHost;
			void this.update();
		}
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

			return parsed.result.data.json;
		} catch (err: unknown) {
			console.log('server response err:', err, host);
		}
		return null;
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
		if (!this.lanServer) {
			return;
		}

		for (const host of [this.lanServer, this.publicServer]) {
			const result = await this.checkServer(host);

			if (result) {
				if (host !== this.currentServer) {
					this.currentServer = host;
					console.log('Set server to:', this.currentServer);
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
