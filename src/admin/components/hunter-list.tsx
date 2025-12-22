import { Link, useCreatePath } from 'react-admin';

import Avatar, { AvatarEmpty } from '@/components/avatar';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { HunterSchema } from '@/lib/schemas';

export function AdminHunter({ hunter }: { hunter: HunterSchema }) {
	const createPath = useCreatePath();
	if (!hunter) {
		return null;
	}
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Link
						to={createPath({
							id: hunter.id,
							resource: 'hunter',
							type: 'edit',
						})}
					>
						<Avatar hunter={hunter} />
					</Link>
				</TooltipTrigger>
				<TooltipContent>{hunter.name}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export function AdminHunterList({
	hunters,
	max,
}: {
	hunters: HunterSchema[];
	max: number;
}) {
	const slots = Array.from(Array(max - hunters.length));
	return (
		<ul className="flex gap-2">
			{hunters.map((hunter) => (
				<li key={hunter.id}>
					<AdminHunter hunter={hunter} />
				</li>
			))}
			{slots.map((_, index) => (
				<li key={index}>
					<AvatarEmpty />
				</li>
			))}
		</ul>
	);
}
