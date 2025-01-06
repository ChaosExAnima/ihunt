import Header from '@/components/header';
import PhotoDisplay from '@/components/photo';
import Rating from '@/components/rating';
import { HuntStatus } from '@/lib/constants';
import { db } from '@/lib/db';

interface HunterPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function HunterPage({ params }: HunterPageProps) {
	const { id } = await params;

	const hunter = await db.hunter.findFirstOrThrow({
		include: {
			_count: {
				select: {
					hunts: {
						where: {
							status: HuntStatus.Complete,
						},
					},
				},
			},
			avatar: true,
		},
		where: { id: Number.parseInt(id) },
	});

	return (
		<>
			{!!hunter.avatar && (
				<PhotoDisplay className="rounded-lg" photo={hunter.avatar} />
			)}
			<Header>{hunter.name}</Header>
			<p>Completed hunts: {hunter._count.hunts}</p>
			<p>
				Rating: <Rating rating={hunter.rating} size="1em" />
			</p>
		</>
	);
}
