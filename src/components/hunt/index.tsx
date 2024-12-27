'use client';

import type { Prisma } from '@prisma/client';

import { acceptHunt } from '@/lib/actions';
import { HuntStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { CircleCheckBig } from 'lucide-react';

import PhotoDisplay from '../photo';
import { Button } from '../ui/button';
import { Carousel, CarouselItem } from '../ui/carousel';

interface HuntAcceptAction {
	onAcceptAction: () => void;
}

type HuntModel = Prisma.HuntGetPayload<{
	include: { hunters: true; photos: true };
}>;

interface HuntProps {
	className?: string;
	hunt: HuntModel;
}

export default function HuntDisplay({ className, hunt }: HuntProps) {
	return (
		<article className={cn(className)}>
			<HuntPhotoDisplay photos={hunt.photos} />
			<p className="text-stone-600 text-xs mb-2">
				{hunt.createdAt.getTime()}
			</p>
			<p className="mb-4">{hunt.description}</p>
			<HuntStatusDisplay
				onAcceptAction={() => acceptHunt(hunt.id)}
				status={hunt.status}
			/>
		</article>
	);
}

function HuntAcceptButton({ onAcceptAction }: HuntAcceptAction) {
	return (
		<Button
			className={cn(
				'bg-green-500 border-green-600 hover:bg-green-300 hover:border-green-400 text-green-950',
				'dark:bg-green-700 dark:border-green-900 dark:hover:bg-green-500',
				'flex mx-auto rounded-full font-bold self-center',
			)}
			onClick={onAcceptAction}
			variant="outline"
		>
			<CircleCheckBig aria-label="Accept hunt" strokeWidth="3" />
			Accept
		</Button>
	);
}

function HuntPhotoDisplay({ photos }: Pick<HuntModel, 'photos'>) {
	const className = 'rounded-lg max-w-full mb-2';
	if (!photos.length) {
		return null;
	}
	if (photos.length === 1) {
		return <PhotoDisplay className={className} photo={photos[0]} />;
	}
	return (
		<Carousel>
			{photos.map((photo) => (
				<CarouselItem key={photo.id}>
					<PhotoDisplay className={className} photo={photo} />
				</CarouselItem>
			))}
		</Carousel>
	);
}

function HuntStatusDisplay({
	onAcceptAction,
	status,
}: HuntAcceptAction & Pick<HuntModel, 'status'>) {
	switch (status) {
		case HuntStatus.Active:
			return <p>Accepted</p>;
		case HuntStatus.Available:
			return <HuntAcceptButton onAcceptAction={onAcceptAction} />;
		case HuntStatus.Cancelled:
			return <p>Cancelled</p>;
		case HuntStatus.Complete:
			return <p>Completed</p>;
	}
	return null;
}
