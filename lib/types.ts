export type Entity = {
	[key: string]: unknown;
	id: number;
};

export type MaybePromise<T = unknown> = Promise<T> | T;
