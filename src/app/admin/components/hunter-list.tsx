import Avatar, { AvatarHunter } from '@/components/avatar';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { Link, useCreatePath } from 'react-admin';

export function AdminHunter({ hunter }: { hunter: AvatarHunter }) {
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
