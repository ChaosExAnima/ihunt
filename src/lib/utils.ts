import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isDev() {
	return import.meta.env.DEV || process.env.NODE_ENV === 'development';
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
