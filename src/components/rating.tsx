import { LucideProps, Star, StarHalf } from 'lucide-react';
import { CSSProperties, memo } from 'react';

import { cn } from '@/lib/styles';
import { arrayOfLength } from '@/lib/utils';

type RatingProps = Omit<LucideProps, 'fill'> & {
	fill?: boolean;
	fillClass?: string;
	max?: number;
	rating: number;
};

function RatingBase({
	className,
	fill = false,
	fillClass,
	max = 0,
	rating,
	...props
}: RatingProps) {
	const baseStars = Math.floor(rating);
	const hasHalfStar = rating - baseStars >= 0.5;
	const remainder = Math.floor(max - (baseStars + (hasHalfStar ? 1 : 0)));
	if (remainder > 0) {
		fill = true;
	}

	const starClassName = cn(
		fill && (fillClass ?? 'fill-black dark:fill-white'),
		className,
	);
	return (
		<span className="inline-flex items-center gap-1">
			{arrayOfLength(baseStars).map((index) => (
				<Star {...props} className={starClassName} key={index} />
			))}
			{hasHalfStar && (
				<RatingStarHalf
					{...props}
					max={max}
					className={starClassName}
					fill={fill}
				/>
			)}
			{remainder > 0 &&
				arrayOfLength(remainder).map((index) => (
					<Star {...props} className={className} key={index} />
				))}
		</span>
	);
}

function RatingStarHalf({
	fill,
	className,
	max,
	...props
}: Omit<RatingProps, 'rating'>) {
	if (!fill) {
		return <StarHalf {...props} className={className} />;
	}

	if (fill && !max) {
		const style: CSSProperties = {};
		if (props.size) {
			style.width =
				typeof props.size === 'string'
					? `calc(${props.size}/2)`
					: `${props.size / 2}px`;
		}
		return (
			<span className="overflow-hidden" style={style}>
				<StarHalf {...props} className={className} />
			</span>
		);
	}

	return (
		<span className="relative">
			<StarHalf {...props} className={cn(className, 'absolute left-0')} />
			<Star {...props} />
		</span>
	);
}

export const Rating = memo(RatingBase);
Rating.displayName = 'Rating';
