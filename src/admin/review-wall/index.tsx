import { useQuery } from '@tanstack/react-query';
import { LoaderCircleIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Header } from '@/components/header';
import { Rating } from '@/components/rating';
import { trpc } from '@/lib/api';
import { Entity } from '@/lib/types';
import { extractIds } from '@/lib/utils';

export function ReviewWall() {
	const { isLoading, wallData } = useReviewWall();

	return (
		<main className="flex h-screen w-screen flex-col items-center justify-center gap-2 bg-black">
			{isLoading && (
				<LoaderCircleIcon className="size-1/4 animate-spin" />
			)}
			{!!wallData && (
				<>
					<Header>{wallData.hunter.handle}</Header>
					<Header level={2}>{wallData.hunt.comment}</Header>
					<Rating
						max={5}
						rating={wallData.hunt.rating ?? 0}
						className="fill-white"
					/>
				</>
			)}
		</main>
	);
}

function useReviewWall() {
	const { data, isLoading: isHunterIdsLoading } = useQuery(
		trpc.admin.getList.queryOptions({ resource: 'hunter' }),
	);

	const hunterIds = useMemo(
		() => extractIds((data?.data as Entity[]) ?? []),
		[data],
	);

	const [hunterDateMap, updateHunterDateMap] = useState<
		Record<number, Date | null>
	>({});
	const [hunterId, setHunterId] = useState(0);
	const reviewDate = hunterDateMap[hunterId] ?? null;

	// const [prevHunterIds, setPrevHunterIds] = useState<number[]>([]);
	// useEffect(() => {
	// 	if (!hunterId) {
	// 		return;
	// 	}

	// 	// setPrevHunterIds((prev) => [
	// 	// 	hunterId,
	// 	// 	...prev.filter((id) => id !== hunterId).slice(0, 3),
	// 	// ]);
	// }, [hunterId]);

	const handleNext = useCallback(() => {
		if (!hunterIds?.length) {
			return;
		}
		const newHunterIds = hunterIds.filter(
			(newHunterId) => hunterDateMap[newHunterId] !== undefined,
		);
		const newHunterId = Math.floor(Math.random() * newHunterIds.length);

		setHunterId(newHunterId);
	}, [hunterIds, hunterDateMap]);

	useEffect(() => {
		if (!hunterIds) {
			return;
		}

		const emptyHunterMap = Object.fromEntries(
			hunterIds.map((hunterId) => [hunterId, null]),
		);

		updateHunterDateMap((prev) => ({ ...emptyHunterMap, ...prev }));
	}, [hunterIds]);

	const { data: wallData, isLoading: isWallDataLoading } = useQuery({
		...trpc.admin.wallData.queryOptions({ hunterId, before: reviewDate }),
		enabled: hunterId > 0,
	});

	if (wallData === undefined && !isWallDataLoading) {
		handleNext();
	}

	return {
		isLoading: isHunterIdsLoading || isWallDataLoading || !wallData,
		wallData,
		next: handleNext,
	};
}
