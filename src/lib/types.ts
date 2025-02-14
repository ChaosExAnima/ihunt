import { HTMLAttributes } from 'react';

export type AttributesWithAsChild<E extends HTMLElement, EProps = object> = {
	asChild?: boolean;
} & EProps &
	Omit<HTMLAttributes<E>, keyof EProps>;

export type PropsWithClassName<T = unknown> = { className?: string } & T;
