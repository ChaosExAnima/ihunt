import HuntDisplay from '@/components/hunt';
import {
	fetchAcceptedHunts,
	fetchCompletedHunts,
	fetchOpenHunts,
} from '@/lib/hunt';

export default async function HuntsPage() {
	const [accepted, open, completed] = await Promise.all([
		fetchAcceptedHunts({ hunters: true, photos: true }),
		fetchOpenHunts({ hunters: true, photos: true }),
		fetchCompletedHunts({ hunters: true, photos: true }),
	]);
	const hunts = [...accepted, ...open, ...completed];
	return (
		<>
			<ul className="flex flex-col gap-4">
				{hunts.map((hunt) => (
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
