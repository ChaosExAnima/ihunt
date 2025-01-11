import Header from '@/components/header';

import { HuntList } from './components';

export default function AdminHuntsPage() {
	return (
		<>
			<Header>Hunts</Header>
			<HuntList />
		</>
	);
}
