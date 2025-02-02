import { LucideProps, Star, StarHalf } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@/lib/utils';

interface RatingProps {
	rating: number;
}

function RatingBase({ rating, ...props }: LucideProps & RatingProps) {
	return (
		<span className={cn('inline-flex items-center gap-1')}>
			{Array.from(Array(Math.floor(rating)).keys()).map((index) => (
				<Star {...props} key={index} />
			))}
			{rating - Math.floor(rating) >= 0.5 && <StarHalf {...props} />}
		</span>
	);
}

const Rating = memo(RatingBase);
Rating.displayName = 'Rating';
export default Rating;
