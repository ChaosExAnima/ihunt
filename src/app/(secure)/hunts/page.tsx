import { HuntStatus } from '@/lib/constants';
import { db } from '@/lib/db';
import { fetchCurrentUser } from '@/lib/user';
import Link from 'next/link';

export default async function HuntsPage() {
	const hunter = await fetchCurrentUser();
	const [availableHunts, oldHunts] = await Promise.all([
		db.hunt.findMany({
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
		}),
		db.hunt.findMany({
			where: {
				status: HuntStatus.Complete,
				hunters: {
					some: {
						hunter,
					},
				},
			},
		}),
	]);
	return (
		<>
			<h2 className="text-4xl font-bold mb-4">Available Hunts</h2>
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
			<h2 className="text-4xl font-bold my-4">Previous Hunts</h2>
			<ul className="flex flex-col gap-4">
				{oldHunts.map((hunt) => (
					<li key={hunt.id}>
						<Link href={`/hunts/${hunt.id}`}>
							<p className="font-bold">{hunt.description}</p>
						</Link>
					</li>
				))}
			</ul>
		</>
	);
}
