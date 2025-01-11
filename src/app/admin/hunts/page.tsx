import Header from '@/components/header';
import { fetchAdminHunts } from '@/lib/hunt';

import { HuntList } from './components';

export default async function AdminHuntsPage() {
	const hunts = await fetchAdminHunts();
	return (
		<>
			<Header>Hunts</Header>
			<HuntList hunts={hunts} />
		</>
	);
}
