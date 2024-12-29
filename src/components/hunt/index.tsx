'use client';

import { acceptHunt } from '@/lib/actions';
import { HuntStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { CircleCheckBig, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import type { HuntModel } from './consts';

import Avatar from '../avatar';
import PhotoDisplay from '../photo';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Carousel, CarouselItem } from '../ui/carousel';

interface HuntAcceptAction {
	onAcceptAction: () => void;
}

interface HuntProps {
	className?: string;
	hunt: HuntModel;
	hunterId: number;
}

export default function HuntDisplay({ className, hunt, hunterId }: HuntProps) {
	const isAccepted = useMemo(
		() => hunt.hunters.some((hunter) => hunter.id === hunterId),
		[hunt.hunters, hunterId],
	);
	return (
		<Card className={cn(className)} slot="article">
			<HuntPhotoDisplay photos={hunt.photos} />
			<p className="text-stone-600 text-xs mb-2">
				{hunt.createdAt.getTime()}
			</p>
			<p className="mb-4">{hunt.description}</p>
			<HuntHuntersDisplay
				hunters={hunt.hunters}
				isAccepted={isAccepted}
				maxHunters={hunt.maxHunters}
			/>
			<HuntStatusDisplay status={hunt.status} />
			{hunt.status === HuntStatus.Available && (
				<HuntAcceptButton
					isAccepted={isAccepted}
					onAcceptAction={() => acceptHunt(hunt.id)}
				/>
			)}
		</Card>
	);
}

function HuntAcceptButton({
	isAccepted,
	onAcceptAction,
}: { isAccepted: boolean } & HuntAcceptAction) {
	if (isAccepted) {
		return (
			<Button
				className={cn(
					'flex mx-auto rounded-full font-bold self-center',
				)}
				onClick={onAcceptAction}
				variant="destructive"
			>
				<X />
				Cancel
			</Button>
		);
	}
	return (
		<Button
			className={cn(
				'bg-green-500 border-green-600 hover:bg-green-300 hover:border-green-400 text-green-950',
				'dark:bg-green-700 dark:border-green-900 dark:hover:bg-green-500',
				'flex mx-auto rounded-full font-bold self-center',
			)}
			onClick={onAcceptAction}
		>
			<CircleCheckBig aria-label="Accept hunt" strokeWidth="3" />
			Accept
		</Button>
	);
}

function HuntHuntersDisplay({
	hunters,
	isAccepted,
	maxHunters,
}: { isAccepted: boolean } & Pick<HuntModel, 'hunters' | 'maxHunters'>) {
	const spotsRemaining = maxHunters - hunters.length;
	return (
		<>
			{hunters.length > 0 && (
				<ul className="flex gap-4 items-center mb-4">
					<li>Hunters:</li>
					{hunters.map((hunter) => (
						<li key={hunter.id}>
							<Link href={`/hunters/${hunter.id}`}>
								<Avatar hunter={hunter} />
							</Link>
						</li>
					))}
				</ul>
			)}
			{spotsRemaining > 0 && !isAccepted && (
				<p className="my-2 font-bold text-center">
					{spotsRemaining} spot{spotsRemaining > 1 && 's'} remaining!
				</p>
			)}
		</>
	);
}

function HuntPhotoDisplay({ photos }: Pick<HuntModel, 'photos'>) {
	const className = 'rounded-lg max-w-full mb-2 aspect-square';
	if (!photos || !photos.length) {
		return null;
	}
	if (photos.length === 1) {
		return <PhotoDisplay className={className} photo={photos[0]} />;
	}
	return (
		<>
			<Carousel>
				{photos.map((photo) => (
					<CarouselItem key={photo.id}>
						<PhotoDisplay className={className} photo={photo} />
					</CarouselItem>
				))}
			</Carousel>
			<p>foo</p>
		</>
	);
}

function HuntStatusDisplay({ status }: Pick<HuntModel, 'status'>) {
	switch (status) {
		case HuntStatus.Active:
			return <p>Accepted</p>;
		case HuntStatus.Cancelled:
			return <p>Cancelled</p>;
		case HuntStatus.Complete:
			return (
				<div
					className={cn(
						'flex mt-4 gap-2 items-center justify-center font-bold self-center',
						'text-green-500',
					)}
				>
					<CircleCheckBig
						aria-label="Completed Hunt"
						className="size-4 shrink-0"
						strokeWidth="3"
					/>
					Complete!
				</div>
			);
	}
	return null;
}
