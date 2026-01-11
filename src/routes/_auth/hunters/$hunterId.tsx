import { useQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { isTRPCClientError } from '@trpc/client';
import * as z from 'zod';

import Header from '@/components/header';
import { HunterGroupList } from '@/components/hunter/group-list';
import { HunterTypeIcon } from '@/components/hunter/type-icon';
import { Loading } from '@/components/loading';
import PhotoDisplay from '@/components/photo';
import { Rating } from '@/components/rating';
import { trpc } from '@/lib/api';
import { hunterSchema, huntSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

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

function RouteComponent() {
	const { hunterId } = Route.useParams();
	const {
		data: hunter,
		error,
		isError,
	} = useQuery(
		trpc.hunter.getOne.queryOptions({
			hunterId,
		}),
	);

	if (isError) {
		console.log('error here:', error);
	}

	if (!hunter) {
		return <Loading />;
	}
	const { avatar } = hunter;

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
						'flex justify-between w-full',
						avatar && 'absolute top-0 p-2',
					)}
				>
					<Rating max={5} rating={hunter.rating} />
					<HunterTypeIcon
						className="text-white"
						size="2em"
						type={hunter.type}
					/>
				</div>
				{!!avatar && <PhotoDisplay className="w-full" photo={avatar} />}
				<div
					className={cn(
						'text-white w-full text-sm',
						avatar && 'absolute bottom-0 p-2 bg-black/40',
						!avatar && 'my-4',
					)}
				>
					<div className="flex gap-2 items-baseline">
						<Header level={2}>{hunter.name}</Header>
						<p>{hunter.pronouns ?? 'they/them'}</p>
					</div>
					<p>@{hunter.handle}</p>
				</div>
			</div>
			{!hunter.alive && (
				<p className="text-rose-600 text-xl">
					User account deactivated
				</p>
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

			<Header level={3}>Reviews</Header>
			<ol>
				{hunter.hunts.map((hunt) => (
					<li key={hunt.id}>
						<Rating max={5} rating={hunt.rating} size="1em" />{' '}
						&ldquo;
						{hunt.comment}&rdquo;
					</li>
				))}
				{hunter.hunts.length === 0 && (
					<li>This hunter hasn't been reviewed yet!</li>
				)}
			</ol>
		</>
	);
}
