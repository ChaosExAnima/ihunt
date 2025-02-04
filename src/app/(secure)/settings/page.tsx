import Link from 'next/link';

import Avatar from '@/components/avatar';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';
import { currencyFormatter } from '@/lib/constants';
import { db } from '@/lib/db';
import { sessionToHunter } from '@/lib/user';

import { AvatarReplaceButton, EditableBlock, SettingBlock } from './components';

export default async function SettingsPage() {
	const hunter = await sessionToHunter();
	const bioChangeAction = async (newBio: string) => {
		'use server';
		if (!newBio || newBio === hunter.bio) {
			return;
		}
		await db.hunter.update({
			data: { bio: newBio },
			where: { id: hunter.id },
		});
	};
	const handleChangeAction = async (rawHandle: string) => {
		'use server';
		const newHandle = rawHandle.replaceAll(/^[a-z0-9\-_]/, '');
		if (!rawHandle || newHandle === hunter.handle) {
			return;
		}
		await db.hunter.update({
			data: { handle: newHandle },
			where: { id: hunter.id },
		});
	};
	return (
		<>
			<Header>Settings</Header>
			<section className="grid grid-cols-[auto_1fr] gap-4 items-center p-4 bg-background rounded-md shadow-xs">
				<SettingBlock label="Name">
					<p>{hunter.name}</p>
				</SettingBlock>
				<SettingBlock label="Pronouns">
					<p>{hunter.pronouns ?? 'They/them'}</p>
				</SettingBlock>
				<SettingBlock
					className="flex-col items-start gap-0"
					label="Cash"
				>
					<p>{currencyFormatter.format(hunter.money)}</p>
					<p className="text-xs text-stone-500">
						Money will arrive the next business day
					</p>
				</SettingBlock>
				<SettingBlock label="Avatar">
					<Avatar hunter={hunter} />
					<AvatarReplaceButton existing={!!hunter.avatar} />
				</SettingBlock>
				<SettingBlock className="gap-2" label="Handle">
					@
					<EditableBlock
						onChange={handleChangeAction}
						value={hunter.handle ?? ''}
					/>
				</SettingBlock>
				<SettingBlock label="Bio">
					<EditableBlock
						multiline
						onChange={bioChangeAction}
						value={hunter.bio ?? ''}
					/>
				</SettingBlock>
			</section>
			<Button asChild variant="secondary">
				<Link href={`/hunters/${hunter.id}`}>Profile</Link>
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
