/// <reference lib="WebWorker" />
/// <reference types="vite/client" />

import { RouteHandlerCallbackOptions } from 'workbox-core';

import { SECOND } from '@/lib/formats';

declare const self: ServiceWorkerGlobalScope;

// List of servers, from local to public.
const serverHosts = (import.meta.env.VITE_SERVER_HOSTS ?? '').split(',');

const MAX_DELAY = SECOND * 60;

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
			console.debug('checking server:', host);
			const url = new URL(host);
			if (
				self.location.protocol !== url.protocol &&
				self.location.protocol === 'https:'
			) {
				return false;
			}

			const response = await fetch(new URL('/trpc/api.hello', url), {
				method: 'HEAD',
				signal: this.abortController.signal,
			});
			if (!response.ok) {
				throw Error('Heartbeat not okay');
			}
			return true;
		} catch (_err: unknown) {
			return false;
		}
	}

	async routeCallback(
		options: RouteHandlerCallbackOptions,
	): Promise<Response> {
		const { request, url } = options;
		if (!this.currentServer || url.host === this.currentServer) {
			console.debug(`sending unmodified request for ${url}`);
			return await fetch(request);
		}
		const newUrl = new URL(url, this.currentServer);
		try {
			const response = await fetch(newUrl, request);
			return response;
		} catch (err: unknown) {
			// TODO: See if server isn't reachable, and retry with other servers.
			console.debug('error with request:', err, newUrl);
		}
		return await fetch(request);
	}

	async update() {
		for (const host of serverHosts) {
			const isAvailable = await this.checkServer(host);
			if (isAvailable) {
				if (host !== this.currentServer) {
					console.debug('setting host to', host);
					this.currentServer = host;
				} else {
					this.delay = Math.min(this.delay * 5, MAX_DELAY);
					console.debug(
						'backing off to',
						this.delay / SECOND,
						'due to same host',
						host,
					);
				}
				break;
			}
		}
		this.timerId = self.setTimeout(this.update.bind(this), this.delay);
	}
}
