import { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

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
			<div className={cn('flex gap-4 items-center', className)}>
				{children}
			</div>
			<Separator className="col-span-2 last:hidden" />
		</>
	);
}
