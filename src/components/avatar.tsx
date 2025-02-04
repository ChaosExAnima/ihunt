import { Prisma } from '@prisma/client';
import { UserRound } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import PhotoDisplay from './photo';

export type AvatarHunter = Prisma.HunterGetPayload<{
	include: { avatar: true };
}>;

interface AvatarProps {
	className?: string;
	hunter: Pick<AvatarHunter, 'avatar' | 'id' | 'name'>;
	link?: boolean;
}

export default function Avatar({
	className,
	hunter,
	link = false,
}: AvatarProps) {
	const pic = hunter.avatar;

	if (link) {
		return (
			<Link href={`/hunters/${hunter.id}`}>
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
			{pic && <PhotoDisplay photo={pic} />}
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
