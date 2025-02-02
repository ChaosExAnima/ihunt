import Link from 'next/link';

import Avatar from '@/components/avatar';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';
import { currencyFormatter } from '@/lib/constants';
import { sessionToHunter } from '@/lib/user';

import { AvatarReplaceButton, SettingBlock } from './components';

export default async function SettingsPage() {
	const user = await sessionToHunter();
	return (
		<>
			<Header>Settings</Header>
			<section className="grid grid-cols-[auto_1fr] gap-4 items-center p-4 bg-background rounded-md shadow-sm">
				<SettingBlock label="Name">
					<p>{user.name}</p>
				</SettingBlock>
				<SettingBlock label="Cash">
					<p>{currencyFormatter.format(user.money)}</p>
				</SettingBlock>
				<SettingBlock label="Avatar">
					<Avatar hunter={user} />
					<AvatarReplaceButton existing={!!user.avatar} />
				</SettingBlock>
			</section>
			<Button asChild variant="secondary">
				<Link href={`/hunters/${user.id}`}>Profile</Link>
			</Button>
			<form
				action={async () => {
					'use server';
					await signOut({ redirectTo: '/' });
				}}
			>
				<Button className="w-full" type="submit" variant="destructive">
					Log out
				</Button>
			</form>
		</>
	);
}
