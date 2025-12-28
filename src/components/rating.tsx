import { LucideProps, Star, StarHalf } from 'lucide-react';
import { memo } from 'react';

import { arrayOfLength, cn } from '@/lib/utils';

type RatingProps = Omit<LucideProps, 'fill'> & {
	fill?: boolean;
	max?: number;
	rating: number;
};

function RatingBase({
	className,
	fill = false,
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

	const starClassName = cn(fill && 'fill-white', className);
	return (
		<span className="inline-flex items-center gap-1">
			{arrayOfLength(baseStars).map((index) => (
				<Star {...props} className={starClassName} key={index} />
			))}
			{hasHalfStar && (
				<RatingStarHalf
					{...props}
					className={className}
					fill={remainder > 0}
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
	...props
}: Omit<RatingProps, 'max' | 'rating'>) {
	if (!fill) {
		return <StarHalf {...props} />;
	}

	return (
		<span className="relative">
			<StarHalf
				{...props}
				className={cn(props.className, 'absolute left-0 fill-white')}
			/>
			<Star {...props} />
		</span>
	);
}

export const Rating = memo(RatingBase);
Rating.displayName = 'Rating';
