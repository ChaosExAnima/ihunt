import { HuntStatus } from '@/lib/constants';
import { db } from '@/lib/db';

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
			<h1>Available Hunts</h1>
			<ul>
				{hunts.map((hunt) => (
					<li key={hunt.id}>
						<p>{hunt.description}</p>
						<p>
							Spots available:{' '}
							{hunt.maxHunters - hunt._count.hunters}
						</p>
					</li>
				))}
			</ul>
		</>
	);
}
