import { huntDisplayInclude, HuntModel } from '@/lib/hunt';
import {
	fetchAcceptedHunts,
	fetchCompletedHunts,
	fetchOpenHunts,
} from '@/lib/hunt';
import { fetchCurrentUser } from '@/lib/user';

import { HuntsCards } from './components';

export default async function HuntsPage() {
	const [accepted, open, completed] = await Promise.all([
		fetchAcceptedHunts(huntDisplayInclude),
		fetchOpenHunts(huntDisplayInclude),
		fetchCompletedHunts(huntDisplayInclude),
	]);
	let hunts = [];
	if (accepted.length > 0) {
		hunts = [...accepted];
	} else {
		hunts = [...open];
	}
	const user = await fetchCurrentUser();

	return (
		<HuntsCards
			completed={completed as unknown as HuntModel[]}
			hunts={hunts as unknown as HuntModel[]}
			userId={user.id}
		/>
	);
}
