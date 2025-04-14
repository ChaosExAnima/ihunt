import { Eye, EyeClosed } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

import ActionButton from '@/components/action-button';
import Avatar from '@/components/avatar';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';
import { db } from '@/lib/db';
import { currencyFormatter } from '@/lib/formats';
import { sessionToHunter, sessionToUser } from '@/lib/user';

import { AvatarReplaceButton, EditableBlock, SettingBlock } from './components';

export default async function SettingsPage() {
	const user = await sessionToUser();
	const hideCashChangeAction = async () => {
		'use server';
		await db.user.update({
			data: { hideMoney: !user.hideMoney },
			where: { id: user.id },
		});
		revalidatePath('/settings');
	};

	const hunter = await sessionToHunter();
	const bioChangeAction = async (rawBio: string) => {
		'use server';
		const newBio = rawBio.trim();
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
		const newHandle = rawHandle.replaceAll(/^[a-z0-9\-_]/g, '');
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
				<SettingBlock className="" label="Cash">
					<div className="flex-col items-start gap-0 grow">
						{!user.hideMoney ? (
							<>
								<p>{currencyFormatter.format(hunter.money)}</p>
								<p className="text-xs text-muted-foreground">
									Money will arrive the next business day
								</p>
							</>
						) : (
							<p className="text-sm text-muted-foreground italic">
								Money is hidden
							</p>
						)}
					</div>
					<ActionButton
						className="text-muted-foreground self-start"
						onChange={hideCashChangeAction}
						size="icon"
						variant="ghost"
					>
						{!user.hideMoney ? <Eye /> : <EyeClosed />}
					</ActionButton>
				</SettingBlock>
				<SettingBlock label="Avatar">
					<Avatar hunter={hunter} />
					<AvatarReplaceButton existing={!!hunter.avatar} />
				</SettingBlock>
				<SettingBlock className="gap-2" label="Handle">
					<EditableBlock
						onChange={handleChangeAction}
						placeholder="@handle"
						prefix="@"
						value={hunter.handle ?? ''}
					/>
				</SettingBlock>
				<SettingBlock label="Bio">
					<EditableBlock
						multiline
						onChange={bioChangeAction}
						placeholder="Tell us about yourself!"
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
