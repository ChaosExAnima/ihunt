import {
	fetchAcceptedHunts,
	fetchCompletedHunts,
	fetchOpenHunts,
} from '@/lib/hunt';
import { sessionToHunter } from '@/lib/user';

import { HuntsCards } from './components';

export default async function HuntsPage() {
	const user = await sessionToHunter();
	const [accepted, open, completed] = await Promise.all([
		fetchAcceptedHunts(),
		fetchOpenHunts(),
		fetchCompletedHunts(),
	]);
	let hunts = [];
	if (accepted.length > 0) {
		hunts = [...accepted];
	} else {
		hunts = [...open];
	}

	return <HuntsCards completed={completed} hunts={hunts} userId={user.id} />;
}
