import { cva, VariantProps } from 'class-variance-authority';
import {
	CircleAlertIcon,
	InfoIcon,
	LucideIcon,
	TriangleAlertIcon,
} from 'lucide-react';
import { ReactNode } from 'react';

const calloutVariants = cva(['rounded-xl py-2 px-3 flex gap-2 items-center'], {
	defaultVariants: {
		variant: 'info',
	},
	variants: {
		variant: {
			info: 'bg-cyan-400',
			warning: 'bg-amber-500',
			error: 'bg-accent text-accent-foreground',
		},
	},
});

interface CalloutProps {
	icon?: LucideIcon | false;
	className?: string;
	children: ReactNode;
}

export function Callout({
	icon,
	variant,
	className,
	children,
}: CalloutProps & VariantProps<typeof calloutVariants>) {
	let Icon = icon;
	if (icon === undefined) {
		switch (variant) {
			case 'info':
				Icon = InfoIcon;
				break;
			case 'warning':
				Icon = TriangleAlertIcon;
				break;
			case 'error':
				Icon = CircleAlertIcon;
		}
	}
	return (
		<aside className={calloutVariants({ variant, className })}>
			{Icon && <Icon />}
			<div>{children}</div>
		</aside>
	);
}
