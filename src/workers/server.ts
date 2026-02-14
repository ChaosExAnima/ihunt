/// <reference lib="WebWorker" />
/// <reference types="vite/client" />

import { RouteHandlerCallbackOptions } from 'workbox-core';

import { MINUTE, SECOND } from '@/lib/formats';

declare const self: ServiceWorkerGlobalScope;

// List of servers, from local to public.
const serverHosts = (import.meta.env.VITE_SERVER_HOSTS ?? '').split(',');

export class WorkerServer {
	private abortController = new AbortController();
	private currentServer = serverHosts.at(-1);
	private delay = 5 * SECOND;
	private timerId = -1;

	constructor() {
		void this.update();
	}

	async checkServer(host: string) {
		try {
			const url = new URL(host);
			const response = await fetch(new URL('/trpc/api.hello', url), {
				method: 'HEAD',
				signal: this.abortController.signal,
			});
			if (!response.ok) {
				throw Error('Heartbeat not okay');
			}
			return true;
		} catch (_err: unknown) {
			console.log('server response err:', _err);
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
				// TODO: See if server isn't reachable, and retry with other servers.
				console.warn('error with request:', err, newUrl);
			}
		}
		return await fetch(request);
	}

	async update() {
		for (const host of serverHosts) {
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
