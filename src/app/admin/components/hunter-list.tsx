import { Link, useCreatePath } from 'react-admin';

import Avatar from '@/components/avatar';
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
