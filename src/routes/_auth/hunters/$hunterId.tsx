import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { isTRPCClientError } from '@trpc/client';

import { Callout } from '@/components/callout';
import { Header } from '@/components/header';
import { HunterGroupList } from '@/components/hunter/group-list';
import { HunterMetaName, HunterMetaRating } from '@/components/hunter/meta';
import { Loading } from '@/components/loading';
import { PhotoDisplay } from '@/components/photo';
import { Rating } from '@/components/rating';
import { Button } from '@/components/ui/button';
import { useHunterId } from '@/hooks/use-hunter';
import { useImageColor } from '@/hooks/use-image-color';
import { trpc } from '@/lib/api';
import { HUNTER_LOW_RATING } from '@/lib/constants';
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

function RouteComponent() {
	const { hunterId } = Route.useParams();
	const { data: hunter } = useQuery(
		trpc.hunter.getOne.queryOptions({
			hunterId,
		}),
	);

	const currentHunterId = useHunterId();
	const isMe = hunterId === currentHunterId?.toString();

	const isLightAvatar = useImageColor(hunter?.avatar?.blurry);

	if (!hunter) {
		return <Loading />;
	}
	const { avatar, hunts, rating } = hunter;
	const lowRating = rating <= HUNTER_LOW_RATING;

	return (
		<>
			<div
				className={cn(
					'flex flex-col',
					avatar && 'relative overflow-hidden rounded-lg',
				)}
			>
				<HunterMetaName
					className={
						avatar
							? 'absolute bottom-0 bg-black/40 px-3 py-2 text-white'
							: 'mb-2'
					}
					hunter={hunter}
				/>
				<HunterMetaRating
					className={cn(
						avatar && 'absolute top-0 px-3 py-2',
						avatar && (isLightAvatar ? 'text-black' : 'text-white'),
					)}
					rating={rating}
				/>
				{!!avatar && (
					<PhotoDisplay
						className="aspect-square w-full"
						photo={avatar}
					/>
				)}
			</div>

			{!hunter.alive && (
				<Header level={3} className="text-rose-600">
					Account deactivated
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
									{hunt.completedAt && (
										<time
											className="text-muted"
											dateTime={hunt.completedAt.toUTCString()}
										>
											{dateFormat(hunt.completedAt)}
										</time>
									)}
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

			{isMe && (
				<Button asChild>
					<Link to="/settings">Edit my profile</Link>
				</Button>
			)}
			<Button variant="secondary" asChild className="w-full">
				<Link to="/hunters">See all hunters in your area</Link>
			</Button>
		</>
	);
}
