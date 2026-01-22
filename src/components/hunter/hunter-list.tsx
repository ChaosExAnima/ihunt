import { HunterSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import { Avatar } from '../avatar';

interface HunterListProps {
	className?: string;
	hunters: HunterSchema[];
}

export function HunterList({ className, hunters }: HunterListProps) {
	return (
		<ul className={cn('flex gap-2', className)}>
			{hunters.map((hunter) => (
				<li key={hunter.id}>
					<Avatar hunter={hunter} link />
				</li>
			))}
		</ul>
	);
}
