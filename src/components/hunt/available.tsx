import { acceptHunt } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { CircleCheckBig, X } from 'lucide-react';
import { useMemo } from 'react';

import DateDisplay from '../date';
import Header from '../header';
import Rating from '../rating';
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
			<Header level={3}>{hunt.name}</Header>
			<p className="my-4">{hunt.description}</p>
			<p className="my-4">
				Required rating:&nbsp;
				<Rating rating={hunt.minRating} size="1em" />
			</p>
			<HuntHuntersDisplay
				hunterId={hunterId}
				hunters={hunt.hunters}
				isAccepted={isAccepted}
				maxHunters={hunt.maxHunters}
			/>
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
