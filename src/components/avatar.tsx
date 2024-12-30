import { cn } from '@/lib/utils';
import { Prisma } from '@prisma/client';

import PhotoDisplay from './photo';

interface AvatarProps {
	hunter: Pick<
		Prisma.HunterGetPayload<{ include: { photos: true } }>,
		'name' | 'photos'
	>;
}

export default function Avatar({ hunter }: AvatarProps) {
	const pic = hunter.photos.at(0) ?? null;

	return (
		<div
			className={cn(
				'border border-stone-400 dark:border-stone-800',
				'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
			)}
		>
			{pic && <PhotoDisplay photo={pic} />}
			<span className="uppercase flex h-full w-full items-center justify-center rounded-full bg-muted">
				{hunter.name.slice(0, 2)}
			</span>
		</div>
	);
}

export function AvatarEmpty({ name = '?' }: { name?: string }) {
	return <Avatar hunter={{ name, photos: [] }} />;
}
