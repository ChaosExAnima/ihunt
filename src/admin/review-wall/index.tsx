import { useQuery } from '@tanstack/react-query';
import { LoaderCircleIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Header } from '@/components/header';
import { PhotoDisplay } from '@/components/photo';
import { Rating } from '@/components/rating';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/api';

export function ReviewWall() {
	const [index, setIndex] = useState(0);
	const { isLoading, data: reviews } = useQuery(
		trpc.admin.wallData.queryOptions(),
	);

	const review = reviews?.at(index);
	const photo =
		review?.hunt.photos.find(
			({ hunterId }) => hunterId === review.hunterId,
		) ?? review?.hunter.avatar;

	const handleNext = useCallback(() => {
		setIndex((prev) => prev + 1);
	}, []);
	const handleReset = useCallback(() => {
		setIndex(0);
	}, []);

	return (
		<main className="flex h-screen w-screen items-center justify-center gap-2 bg-black">
			{isLoading && (
				<LoaderCircleIcon className="size-1/4 animate-spin" />
			)}
			{!!review && (
				<div className="flex max-w-1/2 flex-col items-center gap-4 p-10 text-center">
					<Header className="font-[Kanit]">
						{review.hunter.handle}
					</Header>
					<p>
						<Rating
							max={5}
							rating={review.hunt.rating ?? 0}
							fill
							fillClass="fill-white"
						/>
					</p>
					<p className="font-[Kanit] text-xl font-semibold">
						{review.hunt.comment}
					</p>
					<Button onClick={handleNext} size="lg">
						Next ({index + 1}/{reviews?.length})
					</Button>
				</div>
			)}

			{photo && (
				<PhotoDisplay
					photo={photo}
					className="h-screen object-contain"
				/>
			)}
			{!review && index > 0 && (
				<Button
					onClick={handleReset}
					size="lg"
					className="text-xl font-semibold"
				>
					Start again
				</Button>
			)}
		</main>
	);
}
