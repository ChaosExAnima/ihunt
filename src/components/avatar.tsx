import { Link } from '@tanstack/react-router';
import { UserRound } from 'lucide-react';

import { HunterSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import PhotoDisplay from './photo';

interface AvatarProps {
	className?: string;
	hunter: Pick<HunterSchema, 'avatar' | 'id' | 'name'>;
	link?: boolean;
}

export default function Avatar({
	className,
	hunter,
	link = false,
}: AvatarProps) {
	const photo = hunter.avatar;

	if (link) {
		return (
			<Link
				params={{ hunterId: hunter.id.toString() }}
				to="/hunters/$hunterId"
			>
				<Avatar hunter={hunter} />
			</Link>
		);
	}

	return (
		<div
			className={cn(
				'border border-stone-400 dark:border-stone-800',
				'relative flex size-10 shrink-0 overflow-hidden rounded-full',
				className,
			)}
		>
			{photo && <PhotoDisplay photo={photo} />}
			<span className="uppercase flex h-full w-full items-center justify-center rounded-full bg-muted">
				{hunter.name.slice(0, 2)}
			</span>
		</div>
	);
}

export function AvatarEmpty() {
	return (
		<div
			className={cn(
				'border border-stone-400 dark:border-stone-800',
				'flex size-10 shrink-0 items-center justify-center rounded-full',
			)}
		>
			<UserRound className="dark:text-stone-600" />
		</div>
	);
}
