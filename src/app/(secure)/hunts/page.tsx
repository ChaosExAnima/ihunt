import { HuntStatus } from '@/lib/constants';
import { db } from '@/lib/db';
import Link from 'next/link';

export default async function HuntsPage() {
	const availableHunts = await db.hunt.findMany({
		where: {
			status: HuntStatus.Available,
		},
		include: {
			_count: {
				select: {
					hunters: true,
				},
			},
		},
	});
	return (
		<>
			<ul className="flex flex-col gap-4">
				{availableHunts.map((hunt) => (
					<li key={hunt.id}>
						<Link href={`/hunts/${hunt.id}`}>
							<p className="font-bold">{hunt.description}</p>
							<p>
								Spots available:&nbsp;
								{hunt.maxHunters - hunt._count.hunters}
							</p>
						</Link>
					</li>
				))}
			</ul>
		</>
	);
}
