import { BookOpenText } from 'lucide-react';

import Header from '@/components/header';
import HunterList from '@/components/hunter-list';
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
			<div className="relative rounded-lg overflow-hidden">
				<div className="absolute top-0 p-2 flex justify-between w-full">
					<Rating className="text-white fill-white" rating={1.5} />
					{/* <Swords className="text-white" size="2em" /> */}
					<BookOpenText className="text-white" size="2em" />
				</div>
				{!!hunter.avatar && <PhotoDisplay photo={hunter.avatar} />}
				<div className="absolute bottom-0 text-white p-2 bg-black/40 w-full text-sm">
					<div className="flex gap-2 items-baseline">
						<Header level={2}>{hunter.name}</Header>
						<p>xhe/xer</p>
					</div>
					<p>@monst3rhun7er</p>
				</div>
			</div>
			<p>
				Bio: Bacon ipsum dolor amet venison swine pig drumstick, strip
				steak ball tip frankfurter. Buffalo boudin meatball drumstick,
				fatback tenderloin chicken capicola.
			</p>
			<p>Completed hunts: {hunter._count.hunts}</p>
			<p>Hunt friends:</p>
			<HunterList hunters={[]} />
			<Header level={3}>Reviews</Header>
			<ol>
				<li>
					<Rating rating={2} size="1em" /> &ldquo;Could be
					better&hellip;&rdquo;
				</li>
				<li>
					<Rating rating={4.5} size="1em" /> &ldquo;Killed it!! TAKE
					THAT MONSTER&rdquo;
				</li>
				<li>
					<Rating rating={1} size="1em" /> &ldquo;Wasn&apos;t dressed
					appropriately&hellip;&rdquo;
				</li>
			</ol>
		</>
	);
}
