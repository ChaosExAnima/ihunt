import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Entity } from './types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function extractIds<T extends Entity>(obj: T[]): number[] {
	return obj.map(({ id }) => id);
}

export function idsToObjects(ids?: number[]): Entity[] | undefined {
	if (!ids) {
		return undefined;
	}
	return ids.map((id) => ({ id }));
}

export function isDev() {
	if (typeof process !== 'undefined') {
		return process.env.NODE_ENV === 'development';
	}
	return import.meta.env.DEV;
}

export function isPlainObject(value: unknown): value is object {
	if (typeof value !== 'object' || value === null) return false;

	if (Object.prototype.toString.call(value) !== '[object Object]')
		return false;

	const proto = Object.getPrototypeOf(value) as null | object;
	if (proto === null) return true;

	const Ctor =
		Object.prototype.hasOwnProperty.call(proto, 'constructor') &&
		proto.constructor;
	return (
		typeof Ctor === 'function' &&
		Ctor instanceof Ctor &&
		Function.prototype.call(Ctor) === Function.prototype.call(value)
	);
}

export function omit<T extends object, K extends keyof T>(
	obj: T,
	...keys: K[]
): Omit<T, K> {
	const _ = { ...obj };
	keys.forEach((key) => delete _[key]);
	return _;
}
