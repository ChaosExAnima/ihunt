import { huntDisplayInclude, HuntModel } from '@/lib/constants';
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

	return (
		<HuntsCards
			completed={completed as unknown as HuntModel[]}
			hunts={hunts as unknown as HuntModel[]}
			userId={user.id}
		/>
	);
}
