import { Link } from '@tanstack/react-router';
import { UserRound, UserRoundX } from 'lucide-react';

import { useHunterId } from '@/hooks/use-hunter';
import { HunterSchema } from '@/lib/schemas';
import { PropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';

import PhotoDisplay from './photo';

interface AvatarProps {
	className?: string;
	hunter: Pick<HunterSchema, 'avatar' | 'handle' | 'id'>;
	link?: boolean;
}

export default function Avatar({
	className,
	hunter,
	link = false,
}: AvatarProps) {
	const photo = hunter.avatar;
	const currentHunterId = useHunterId();

	if (link) {
		return (
			<Link
				params={{ hunterId: hunter.id.toString() }}
				to={
					currentHunterId === hunter.id
						? '/settings'
						: '/hunters/$hunterId'
				}
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
			{photo && (
				<PhotoDisplay fit="fill" height={40} photo={photo} width={40} />
			)}
			<span className="uppercase flex h-full w-full items-center justify-center rounded-full bg-muted">
				{hunter.handle.slice(0, 2)}
			</span>
		</div>
	);
}

export function AvatarEmpty({ className }: PropsWithClassName) {
	return (
		<div
			className={cn(
				'border border-stone-400 dark:border-stone-800',
				'flex size-10 shrink-0 items-center justify-center rounded-full',
				className,
			)}
		>
			<UserRound className="dark:text-stone-600" />
		</div>
	);
}

export function AvatarLocked({ className }: PropsWithClassName) {
	return (
		<div
			className={cn(
				'border border-stone-400 dark:border-stone-800',
				'flex size-10 shrink-0 items-center justify-center rounded-full',
				className,
			)}
		>
			<UserRoundX className="dark:text-stone-600" />
		</div>
	);
}
