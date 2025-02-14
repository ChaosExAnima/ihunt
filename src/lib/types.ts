import { HTMLAttributes } from 'react';

export type PropsWithClassName<T = unknown> = { className?: string } & T;

export type AttributesWithAsChild<E extends HTMLElement, EProps = {}> = EProps &
	Omit<HTMLAttributes<E>, keyof EProps> & {
		asChild?: boolean;
	};
