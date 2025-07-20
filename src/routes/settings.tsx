import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Eye, EyeClosed } from 'lucide-react';

import ActionButton from '@/components/action-button';
import Avatar from '@/components/avatar';
import Header from '@/components/header';
import { AvatarReplaceButton } from '@/components/settings/avatar-replace';
import { EditableBlock } from '@/components/settings/editable-block';
import { SettingBlock } from '@/components/settings/setting-block';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/api';
import { useCurrencyFormat } from '@/lib/formats';

export const Route = createFileRoute('/settings')({
	component: Settings,
	async loader({ context: { queryClient } }) {
		await queryClient.ensureQueryData(
			trpc.settings.getHunter.queryOptions(),
		);
	},
});

function Settings() {
	const { data: hunter, isLoading } = useQuery(
		trpc.settings.getHunter.queryOptions(),
	);
	const { mutate: updateMoney } = useMutation(
		trpc.settings.updateMoney.mutationOptions(),
	);
	const { mutate: updateBio } = useMutation(
		trpc.settings.updateBio.mutationOptions(),
	);
	const { mutate: updateHandle } = useMutation(
		trpc.settings.updateHandle.mutationOptions(),
	);
	const { mutate: logOut } = useMutation(
		trpc.settings.logOut.mutationOptions(),
	);

	const money = useCurrencyFormat(hunter?.money ?? 0);

	if (isLoading || !hunter) {
		return null;
	}
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
						{money !== '' ? (
							<>
								<p>{money}</p>
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
						onChange={updateMoney}
						size="icon"
						variant="ghost"
					>
						{money !== '' ? <Eye /> : <EyeClosed />}
					</ActionButton>
				</SettingBlock>
				<SettingBlock label="Avatar">
					<Avatar hunter={hunter} />
					<AvatarReplaceButton existing={!!hunter.avatar} />
				</SettingBlock>
				<SettingBlock className="gap-2" label="Handle">
					<EditableBlock
						onChange={updateHandle}
						placeholder="@handle"
						prefix="@"
						value={hunter.handle ?? ''}
					/>
				</SettingBlock>
				<SettingBlock label="Bio">
					<EditableBlock
						multiline
						onChange={updateBio}
						placeholder="Tell us about yourself!"
						value={hunter.bio ?? ''}
					/>
				</SettingBlock>
			</section>
			<Button asChild variant="secondary">
				<Link
					params={{ hunterId: hunter.id.toString() }}
					to="/hunters/$hunterId"
				>
					Profile
				</Link>
			</Button>
			<ActionButton
				className="w-full"
				onChange={logOut}
				type="submit"
				variant="destructive"
			>
				Log out
			</ActionButton>
		</>
	);
}
