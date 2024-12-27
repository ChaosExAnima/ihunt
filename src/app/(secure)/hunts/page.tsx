import HuntDisplay from '@/components/hunt';
import { HuntStatus } from '@/lib/constants';
import { db } from '@/lib/db';
import { fetchCurrentUser } from '@/lib/user';

export default async function HuntsPage() {
	const currentUser = await fetchCurrentUser();
	const acceptedHunts = await db.hunt.findMany({
		include: {
			hunters: true,
			photos: true,
		},
		where: {
			hunters: {
				some: {
					hunterId: currentUser.id,
				},
			},
			status: HuntStatus.Active,
		},
	});
	const availableHunts = await db.hunt.findMany({
		include: {
			hunters: true,
			photos: true,
		},
		where: {
			status: HuntStatus.Available,
		},
	});
	return (
		<>
			<ul className="flex flex-col gap-4">
				{acceptedHunts.concat(availableHunts).map((hunt) => (
					<li key={hunt.id}>
						<HuntDisplay
							className="border border-stone-400 dark:border-stone-800 p-4 rounded-xl shadow-lg"
							hunt={hunt}
						/>
					</li>
				))}
			</ul>
		</>
	);
}
