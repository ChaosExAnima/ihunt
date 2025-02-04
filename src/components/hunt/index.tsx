'use client';

import { CircleCheckBig, Crosshair } from 'lucide-react';

import { HuntModel, HuntStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

import DateDisplay from '../date';
import Header from '../header';
import { Card } from '../ui/card';
import AvailableHunt from './available';
import HuntHuntersDisplay from './hunters';
import HuntPhotoDisplay from './photos';

export interface HuntProps {
	className?: string;
	hunt: HuntModel;
	hunterId: number;
}

export default function HuntDisplay(props: HuntProps) {
	const { className, hunt, hunterId } = props;
	if (hunt.status === HuntStatus.Available) {
		return <AvailableHunt {...props} />;
	} else if (hunt.status === HuntStatus.Cancelled) {
		return null;
	}
	return (
		<Card className={cn(className, 'flex flex-col')} slot="article">
			<HuntPhotoDisplay photos={hunt.photos} />
			<p className="text-stone-600 text-xs mb-2">
				{hunt.status === HuntStatus.Complete ? 'finished' : 'added'}
				&nbsp;
				<DateDisplay date={hunt.completedAt || hunt.createdAt} />
			</p>
			<Header level={3}>{hunt.name}</Header>
			<p className="my-4 grow">{hunt.description}</p>
			<HuntHuntersDisplay
				hunterId={hunterId}
				hunters={hunt.hunters}
				maxHunters={hunt.maxHunters}
			/>
			{hunt.status === HuntStatus.Active && (
				<div className="flex mt-4 gap-2 items-center justify-center text-blue-500 text-center font-semibold">
					<Crosshair className="size-4 shrink-0" />
					Ongoing
				</div>
			)}
			{hunt.status === HuntStatus.Complete && (
				<div
					className={cn(
						'flex mt-4 gap-2 items-center justify-center font-semibold self-center',
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
			)}
		</Card>
	);
}
