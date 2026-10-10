import type { ElementType, HTMLProps, PropsWithChildren } from 'react';

import { cn } from '@/lib/styles';

interface HeaderProps extends HTMLProps<HTMLHeadingElement> {
	className?: string;
	level?: 1 | 2 | 3 | 4;
	variant?: 1 | 2 | 3 | 4;
}

export function Header({
	children,
	className,
	level = 1,
	variant = level,
	...props
}: PropsWithChildren<HeaderProps>) {
	const Component: ElementType = `h${level}`;
	return (
		<Component
			className={cn(
				'scroll-m-20 tracking-tight',
				variant === 1 ? 'text-4xl font-extrabold' : 'font-semibold',
				variant === 2 && 'text-3xl',
				variant === 3 && 'text-xl',
				variant === 4 && 'text-lg',
				className,
			)}
			{...props}
		>
			{children}
		</Component>
	);
}
