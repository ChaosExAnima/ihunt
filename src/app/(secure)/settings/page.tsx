import Avatar from '@/components/avatar';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { fetchCurrentUser } from '@/lib/user';
import Link from 'next/link';

import { AvatarReplaceButton, SettingBlock } from './components';

const formatter = new Intl.NumberFormat('de-DE', {
	currency: 'EUR',
	maximumFractionDigits: 0,
	style: 'currency',
});

export default async function SettingsPage() {
	const user = await fetchCurrentUser();
	return (
		<>
			<Header>Settings</Header>
			<section className="grid grid-cols-[auto_1fr] gap-4 items-center p-4 bg-background rounded-md shadow-sm">
				<SettingBlock label="Name">
					<p>{user.name}</p>
				</SettingBlock>
				<SettingBlock label="Cash">
					<p>{formatter.format(user.money)}</p>
				</SettingBlock>
				<SettingBlock label="Avatar">
					<Avatar hunter={user} />
					<AvatarReplaceButton existing={!!user.avatar} />
				</SettingBlock>
			</section>
			<Button asChild variant="secondary">
				<Link href={`/hunters/${user.id}`}>Profile</Link>
			</Button>
			<Button asChild variant="destructive">
				<Link href="/">Log out</Link>
			</Button>
		</>
	);
}
