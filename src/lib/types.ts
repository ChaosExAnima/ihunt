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

export interface Entity {
	id: number;
}

export type PropsWithClassName<T = unknown> = T & { className?: string };
