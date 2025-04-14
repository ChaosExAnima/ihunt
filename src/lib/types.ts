import { ComponentProps, HTMLAttributes, JSX } from 'react';

export type ComponentPropsWithoutProps<
	E extends keyof JSX.IntrinsicElements,
	EProps = object,
> = EProps & Omit<ComponentProps<E>, keyof EProps>;

export type AttributesWithAsChild<E extends HTMLElement, EProps = object> = {
	asChild?: boolean;
} & EProps &
	Omit<HTMLAttributes<E>, keyof EProps>;

export type PropsWithClassName<T = unknown> = { className?: string } & T;
