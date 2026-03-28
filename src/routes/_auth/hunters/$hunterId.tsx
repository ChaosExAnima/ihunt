import { useQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { isTRPCClientError } from '@trpc/client';
import { useCallback, useMemo } from 'react';
import { thumbHashToAverageRGBA } from 'thumbhash';
import * as z from 'zod';

import { Callout } from '@/components/callout';
import { Header } from '@/components/header';
import { HunterGroupList } from '@/components/hunter/group-list';
import { HunterTypeIcon } from '@/components/hunter/type-icon';
import { Loading } from '@/components/loading';
import { PhotoDisplay } from '@/components/photo';
import { Rating } from '@/components/rating';
import { useHunterId } from '@/hooks/use-hunter';
import { trpc } from '@/lib/api';
import { HUNTER_LOW_RATING, HUNTER_TOP_MIN_RATING } from '@/lib/constants';
import { dateFormat } from '@/lib/formats';
import { hunterSchema, huntSchema } from '@/lib/schemas';
import { cn } from '@/lib/styles';

export const hunterPageSchema = z.object({
	...hunterSchema.shape,
	friends: hunterSchema.array(),
	huntCount: z.number().min(0),
	hunts: huntSchema.array(),
	rating: z.number().max(5).min(1),
});
export type HunterPageSchema = z.infer<typeof hunterPageSchema>;

export const Route = createFileRoute('/_auth/hunters/$hunterId')({
	component: RouteComponent,
	async loader({ context: { queryClient }, params: { hunterId } }) {
		try {
			const hunter = await queryClient.ensureQueryData(
				trpc.hunter.getOne.queryOptions({
					hunterId,
				}),
			);
			if (hunter.groupId) {
				void queryClient.prefetchQuery(
					trpc.hunter.getGroup.queryOptions({
						hunterId: hunter.id,
					}),
				);
			}
		} catch (err) {
			if (isTRPCClientError(err) && err.message === 'NOT_FOUND') {
				throw notFound();
			}
			throw err;
		}
	},
});

const LIGHT_THRESHOLD = 0.5;

function RouteComponent() {
	const { hunterId } = Route.useParams();
	const { data: hunter } = useQuery(
		trpc.hunter.getOne.queryOptions({
			hunterId,
		}),
	);

	const currentHunterId = useHunterId();
	const isMe = hunterId === currentHunterId?.toString();

	const thumbHash = hunter?.avatar?.blurry ?? null;
	const isLightAvatar = useMemo(() => {
		if (!thumbHash) {
			return false;
		}
		const binary = new Uint8Array(
			atob(thumbHash)
				.split('')
				.map((x) => x.charCodeAt(0)),
		);
		const average = thumbHashToAverageRGBA(binary);
		return (
			average.r >= LIGHT_THRESHOLD &&
			average.g >= LIGHT_THRESHOLD &&
			average.b >= LIGHT_THRESHOLD
		);
	}, [thumbHash]);

	const formatDate = useCallback((date: Date) => dateFormat(date), []);

	if (!hunter) {
		return <Loading />;
	}
	const { avatar, hunts, rating } = hunter;
	const topHunter = rating > HUNTER_TOP_MIN_RATING;
	const lowRating = rating <= HUNTER_LOW_RATING;

	return (
		<>
			<div
				className={cn(
					'rounded-lg',
					avatar && 'relative overflow-hidden',
				)}
			>
				<div
					className={cn(
						'flex w-full justify-between',
						avatar && 'absolute top-0 p-2',
						avatar && (isLightAvatar ? 'text-black' : 'text-white'),
					)}
				>
					<div className="flex items-center gap-2">
						<Rating
							fillClass={cn(
								'fill-current',
								topHunter && 'fill-yellow-400',
							)}
							className={cn(topHunter && 'text-yellow-600')}
							max={5}
							rating={hunter.rating}
						/>

						{topHunter && (
							<span className="rounded-lg bg-yellow-400 px-2 py-1 text-xs">
								Top hunter
							</span>
						)}
					</div>
					<HunterTypeIcon size="2em" type={hunter.type} />
				</div>
				{!!avatar && <PhotoDisplay className="w-full" photo={avatar} />}
				<div
					className={cn(
						'w-full text-sm dark:text-white',
						avatar && 'absolute bottom-0 bg-black/40 p-2',
						!avatar && 'my-4',
					)}
				>
					<div className="flex items-baseline gap-2">
						<Header level={1} variant={2}>
							{hunter.name}
						</Header>
						<p>{hunter.pronouns ?? 'they/them'}</p>
					</div>
					<p>@{hunter.handle}</p>
				</div>
			</div>
			{!hunter.alive && (
				<Header level={3} className="text-rose-600">
					User account deactivated
				</Header>
			)}

			{lowRating && isMe && (
				<Callout variant="error">
					<p className="font-semibold">Your rating is low!</p>
					<p className="text-sm">
						Take more hunts to boost your rating
					</p>
				</Callout>
			)}

			{hunter.bio && (
				<>
					<Header level={3}>About me</Header>
					<p>{hunter.bio}</p>
				</>
			)}

			<HunterGroupList hunterId={hunter.id}>
				<Header level={3}>Friends</Header>
			</HunterGroupList>

			{hunts.length > 0 && (
				<>
					<Header level={3}>Reviews</Header>
					<ol>
						{hunter.hunts.map((hunt) => (
							<li
								className="border-b py-2 first:pt-0 last:border-0"
								key={hunt.id}
							>
								<p className="flex items-center gap-2">
									<Rating
										max={5}
										rating={hunt.rating}
										size="1em"
									/>
									<span className="text-muted">
										{formatDate(
											hunt.completedAt ??
												hunt.scheduledAt ??
												hunt.createdAt,
										)}
									</span>
								</p>
								<p>&ldquo;{hunt.comment}&rdquo;</p>
							</li>
						))}
					</ol>
				</>
			)}
		</>
	);
}
