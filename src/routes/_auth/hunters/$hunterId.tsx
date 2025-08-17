import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

import Header from '@/components/header';
import { HunterList } from '@/components/hunter-list';
import PhotoDisplay from '@/components/photo';
import Rating from '@/components/rating';
import { hunterTypeIcon } from '@/lib/hunter';
import { hunterSchema, huntSchema } from '@/lib/schemas';

export const hunterPageSchema = z.object({
	...hunterSchema.shape,
	friends: z.array(hunterSchema),
	huntCount: z.number().min(0),
	hunts: z.array(huntSchema),
	rating: z.number().max(5).min(1),
});
export type HunterPageSchema = z.infer<typeof hunterPageSchema>;

export const Route = createFileRoute('/_auth/hunters/$hunterId')({
	component: RouteComponent,
	loader({ params }) {
		return hunterPageSchema.parse(params);
	},
});

function RouteComponent() {
	const { friends, huntCount, hunts, rating, ...hunter } =
		Route.useLoaderData();
	const HunterType = hunterTypeIcon(hunter.type);
	return (
		<>
			<div className="relative rounded-lg overflow-hidden">
				<div className="absolute top-0 p-2 flex justify-between w-full">
					<Rating
						className="text-white fill-white"
						rating={rating ?? 1}
					/>
					{HunterType && (
						<HunterType className="text-white" size="2em" />
					)}
				</div>
				{!!hunter.avatar && <PhotoDisplay photo={hunter.avatar} />}
				<div className="absolute bottom-0 text-white p-2 bg-black/40 w-full text-sm">
					<div className="flex gap-2 items-baseline">
						<Header level={2}>{hunter.name}</Header>
						<p>{hunter.pronouns ?? 'they/them'}</p>
					</div>
					<p>@{hunter.handle}</p>
				</div>
			</div>
			{hunter.bio && <p>{hunter.bio}</p>}
			<p>Completed hunts: {huntCount}</p>
			<p>Hunt friends:</p>
			<HunterList hunters={friends} />
			<Header level={3}>Reviews</Header>
			<ol>
				{hunts.map((hunt) => (
					<li key={hunt.id}>
						<Rating rating={hunt.rating ?? 1} size="1em" /> &ldquo;
						{hunt.comment}&rdquo;
					</li>
				))}
			</ol>
		</>
	);
}
