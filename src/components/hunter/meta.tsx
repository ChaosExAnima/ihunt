import { HUNTER_TOP_MIN_RATING } from '@/lib/constants';
import { HunterSchema } from '@/lib/schemas';
import { cn } from '@/lib/styles';

import { Header } from '../header';
import { Rating } from '../rating';
import { HunterTypeIcon } from './type-icon';

export function HunterMetaName({
	className,
	hunter,
}: {
	className?: string;
	hunter: Pick<HunterSchema, 'name' | 'pronouns' | 'handle' | 'type'>;
}) {
	return (
		<div className={cn('flex w-full gap-2', className)}>
			<div className="grow">
				<Header level={1} variant={2} className="">
					{hunter.name}
				</Header>
				<p>
					@{hunter.handle} &bull; {hunter.pronouns ?? 'they/them'}
				</p>
			</div>
			<HunterTypeIcon size="2em" type={hunter.type} />
		</div>
	);
}

export function HunterMetaRating({
	className,
	rating,
}: {
	className?: string;
	rating: number;
}) {
	const topHunter = rating >= HUNTER_TOP_MIN_RATING;

	return (
		<div className={cn('flex w-full justify-between', className)}>
			<div className="flex items-center gap-2">
				<Rating
					fillClass="fill-current"
					fill
					className={cn(topHunter && 'text-yellow-500')}
					max={5}
					rating={rating}
				/>

				{topHunter && (
					<span className="rounded-lg bg-yellow-400 px-2 py-1 text-xs dark:text-black">
						Top hunter
					</span>
				)}
			</div>
		</div>
	);
}
