import {
	CircleAlert,
	CircleCheckBig,
	Clock,
	MapPin,
	Skull,
	X,
} from 'lucide-react';
import { useMemo } from 'react';

import { acceptHunt } from '@/lib/hunt';
import { cn } from '@/lib/utils';

import Header from '../header';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import HuntHuntersDisplay from './hunters';
import { HuntProps } from './index';
import HuntPhotoDisplay from './photos';

interface HuntAcceptAction {
	onAcceptAction: () => void;
}

export default function AvailableHunt({
	className,
	hunt,
	hunterId,
}: HuntProps) {
	const isAccepted = useMemo(
		() => hunt.hunters.some((hunter) => hunter.id === hunterId),
		[hunt.hunters, hunterId],
	);
	return (
		<Card className={cn(className, 'flex flex-col')}>
			<div className="relative rounded-lg overflow-hidden">
				<HuntPhotoDisplay photos={hunt.photos} />
				<div className="top-0 left-0 absolute p-2">
					<div className="flex text-rose-700">
						<Skull />
						<Skull />
					</div>
					<span className="text-white font-semibold">1.000€</span>
				</div>
				<div className="absolute p-2 bottom-0 bg-black/40 w-full">
					<Header
						className="flex gap-2 items-center text-white"
						level={3}
					>
						{hunt.name}
					</Header>
					<p className="text-rose-600 text-xs">
						<MapPin
							className="inline-block align-text-bottom"
							size="1em"
						/>
						Königsforst,&nbsp;
						<Clock
							className="inline-block align-text-bottom"
							size="1em"
						/>
						14:00
					</p>
				</div>
			</div>
			<div className="flex grow">
				<p className="my-2 text-primary/60 text-sm grow">
					{hunt.description}
				</p>
				<Button className="text-rose-600" size="icon" variant="ghost">
					<CircleAlert />
				</Button>
			</div>
			<HuntHuntersDisplay
				hunterId={hunterId}
				hunters={hunt.hunters}
				isAccepted={isAccepted}
				maxHunters={hunt.maxHunters}
			/>
			{hunt.maxHunters - hunt.hunters.length > 0 && !isAccepted && (
				<p className="my-2 text-center text-sm">
					You have 2 hunts left today.
					<br />
					<strong className="text-green-500">
						Buy iHunt Premium to unlock more!
					</strong>
				</p>
			)}
			<HuntAcceptButton
				isAccepted={isAccepted}
				onAcceptAction={() => acceptHunt(hunt.id)}
			/>
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
