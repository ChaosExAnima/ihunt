import { acceptHunt } from '@/lib/hunt';
import { cn } from '@/lib/utils';
import { CircleCheckBig, Skull, X } from 'lucide-react';
import { useMemo } from 'react';

import DateDisplay from '../date';
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
		<Card className={cn(className)} slot="article">
			<HuntPhotoDisplay photos={hunt.photos} />
			<p className="text-stone-600 text-xs mb-2">
				added <DateDisplay date={hunt.createdAt} />
			</p>
			<Header className="flex gap-2 items-center" level={3}>
				<span>{hunt.name}</span>
				<Skull />
				<Skull />
			</Header>
			<p className="my-4 text-primary/60">{hunt.description}</p>
			<HuntHuntersDisplay
				hunterId={hunterId}
				hunters={hunt.hunters}
				isAccepted={isAccepted}
				maxHunters={hunt.maxHunters}
			/>
			{hunt.maxHunters - hunt.hunters.length > 0 && !isAccepted && (
				<p className="my-2 text-center">
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
