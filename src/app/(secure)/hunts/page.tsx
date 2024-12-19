import { HuntStatus } from '@/lib/constants';
import { db } from '@/lib/db';
import Link from 'next/link';

export default async function HuntsPage() {
	const hunts = await db.hunt.findMany({
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
			<h1 className="text-4xl font-bold mb-4">Available Hunts</h1>
			<ul className="flex flex-col gap-4">
				{hunts.map((hunt) => (
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
