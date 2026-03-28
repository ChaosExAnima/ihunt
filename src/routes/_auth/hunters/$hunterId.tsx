import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { isTRPCClientError } from '@trpc/client';
import { useMemo } from 'react';
import { thumbHashToAverageRGBA } from 'thumbhash';

import { Callout } from '@/components/callout';
import { Header } from '@/components/header';
import { HunterGroupList } from '@/components/hunter/group-list';
import { HunterTypeIcon } from '@/components/hunter/type-icon';
import { Loading } from '@/components/loading';
import { PhotoDisplay } from '@/components/photo';
import { Rating } from '@/components/rating';
import { Button } from '@/components/ui/button';
import { useHunterId } from '@/hooks/use-hunter';
import { trpc } from '@/lib/api';
import { HUNTER_LOW_RATING, HUNTER_TOP_MIN_RATING } from '@/lib/constants';
import { dateFormat } from '@/lib/formats';
import { cn } from '@/lib/styles';

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

	if (!hunter) {
		return <Loading />;
	}
	const { avatar, hunts, rating } = hunter;
	const topHunter = rating >= HUNTER_TOP_MIN_RATING;
	const lowRating = rating <= HUNTER_LOW_RATING;

	return (
		<>
			<div
				className={cn(
					'flex flex-col',
					avatar && 'relative overflow-hidden rounded-lg',
				)}
			>
				<div
					className={cn(
						'flex w-full gap-2 text-sm',
						avatar &&
							'absolute bottom-0 bg-black/40 px-3 py-2 text-white',
						!avatar && 'mb-2',
					)}
				>
					<div className="grow">
						<div className="flex items-baseline gap-2">
							<Header
								level={1}
								variant={2}
								className="leading-none"
							>
								{hunter.name}
							</Header>
							<p>{hunter.pronouns ?? 'they/them'}</p>
						</div>
						<p>@{hunter.handle}</p>
					</div>
					<HunterTypeIcon size="2em" type={hunter.type} />
				</div>
				<div
					className={cn(
						'flex w-full justify-between',
						avatar && 'absolute top-0 px-3 py-2',
						avatar && (isLightAvatar ? 'text-black' : 'text-white'),
					)}
				>
					<div className="flex items-center gap-2">
						<Rating
							fillClass="fill-current"
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
				{!!avatar && (
					<PhotoDisplay
						className="aspect-square w-full"
						photo={avatar}
					/>
				)}
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

			<Header level={3}>Friends</Header>
			<HunterGroupList hunterId={hunter.id} />

			<div className="grow">
				<Header level={3}>Reviews</Header>
				{hunts.length > 0 && (
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
									<time
										className="text-muted"
										dateTime={(
											hunt.completedAt ?? hunt.createdAt
										).toUTCString()}
									>
										{dateFormat(
											hunt.completedAt ?? hunt.createdAt,
										)}
									</time>
								</p>
								{hunt.comment && (
									<p>&ldquo;{hunt.comment}&rdquo;</p>
								)}
							</li>
						))}
					</ol>
				)}
				{hunts.length === 0 && (
					<p className="text-muted text-sm">Nothing yet</p>
				)}
			</div>

			<Button variant="secondary" asChild className="w-full">
				<Link to="/hunters">See all hunters in your area</Link>
			</Button>
		</>
	);
}
