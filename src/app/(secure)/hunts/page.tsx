import { fetchAllPublicHunts, fetchCompletedHunts } from '@/server/hunt';
import { sessionToHunter } from '@/server/user';

import { HuntsCards, HuntsCompleted, HuntsWrapper } from './components';

export default async function HuntsPage() {
	const user = await sessionToHunter();
	const [hunts, completed] = await Promise.all([
		fetchAllPublicHunts(),
		fetchCompletedHunts(),
	]);

	return (
		<HuntsWrapper>
			<HuntsCards hunts={hunts} userId={user.id} />
			<HuntsCompleted hunts={completed} userId={user.id} />
		</HuntsWrapper>
	);
}
