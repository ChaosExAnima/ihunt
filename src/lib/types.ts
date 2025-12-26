import { ComponentProps, HTMLAttributes, JSX } from 'react';

export type AttributesWithAsChild<
	E extends HTMLElement,
	EProps = object,
> = EProps &
	Omit<HTMLAttributes<E>, keyof EProps> & {
		asChild?: boolean;
	};

export type ComponentPropsWithoutProps<
	E extends keyof JSX.IntrinsicElements,
	EProps = object,
> = EProps & Omit<ComponentProps<E>, keyof EProps>;

export type Entity = {
	[key: string]: unknown;
	id: number;
};

export type MaybePromise<T = unknown> = Promise<T> | T;

export type PropsWithClassName<T = unknown> = T & { className?: string };
