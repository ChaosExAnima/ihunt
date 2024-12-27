import type { ElementType, PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

interface HeaderProps {
	className?: string;
	level?: 1 | 2 | 3 | 4;
}

export default function Header({
	children,
	className,
	level = 2,
}: PropsWithChildren<HeaderProps>) {
	const Component: ElementType = `h${level}`;
	return (
		<Component
			className={cn(
				'scroll-m-20 tracking-tight',
				level === 1 ? 'text-4xl font-extrabold' : 'font-semibold',
				level === 2 && 'text-3xl',
				level === 3 && 'text-2xl',
				level === 4 && 'text-xl',
				className,
			)}
		>
			{children}
		</Component>
	);
}
