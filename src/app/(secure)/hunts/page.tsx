import { huntDisplayInclude, HuntModel } from '@/components/hunt/consts';
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
	const hunts = [...accepted, ...open, ...completed];
	const user = await fetchCurrentUser();

	return (
		<HuntsCards hunts={hunts as unknown as HuntModel[]} userId={user.id} />
	);
}
