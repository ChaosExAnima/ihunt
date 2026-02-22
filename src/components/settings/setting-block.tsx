import { PropsWithChildren } from 'react';

import { cn } from '@/lib/styles';

import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

interface SettingBlockProps {
	className?: string;
	id?: string;
	label: string;
}

export function SettingBlock({
	children,
	className,
	id,
	label,
}: PropsWithChildren<SettingBlockProps>) {
	return (
		<>
			<Label htmlFor={id}>{label}</Label>
			<div className={cn('flex items-center gap-4', className)}>
				{children}
			</div>
			<Separator className="col-span-2 last:hidden" />
		</>
	);
}
