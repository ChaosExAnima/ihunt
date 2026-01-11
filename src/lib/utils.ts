import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Entity } from './types';

export function arrayOfLength(length: number): number[] {
	if (length <= 0) {
		return [];
	}
	return [...Array(length).keys()];
}

export function clamp({
	input,
	max,
	min = 0,
}: {
	input: number;
	max: number;
	min?: number;
}) {
	return Math.min(max, Math.max(min, input));
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function extractIds<T extends Entity>(obj: T[]): number[] {
	return extractKey(obj, 'id');
}

export function extractKey<
	T extends Record<string, unknown>,
	K extends keyof T = keyof T,
>(obj: T[], key: K) {
	return obj.map(({ [key]: value }) => value);
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

export function toArray<T>(input: T | T[]): T[] {
	return Array.isArray(input) ? input : [input];
}
