import { useQuery } from '@tanstack/react-query';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Header } from '@/components/header';
import { PhotoDisplay } from '@/components/photo';
import { Rating } from '@/components/rating';
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

	const totalImages = reviews?.length ?? 0;
	useEffect(() => {
		if (!totalImages) {
			return;
		}
		const timerId = window.setInterval(() => {
			setIndex((prev) => (prev + 1 >= totalImages ? 0 : prev + 1));
		}, 10_000);

		return () => {
			window.clearInterval(timerId);
		};
	}, [totalImages]);

	return (
		<main className="relative flex h-screen w-screen items-center justify-center gap-2 bg-black">
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
				</div>
			)}

			{totalImages > 0 && (
				<span className="absolute bottom-10 left-10 text-sm text-white">
					{index + 1} / {totalImages}
				</span>
			)}

			{photo && (
				<PhotoDisplay
					photo={photo}
					className="h-screen object-contain"
				/>
			)}
		</main>
	);
}
