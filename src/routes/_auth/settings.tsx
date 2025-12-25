import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Eye, EyeClosed } from 'lucide-react';
import { useCallback } from 'react';

import Avatar from '@/components/avatar';
import Header from '@/components/header';
import { AvatarReplaceButton } from '@/components/settings/avatar-replace';
import { EditableBlock } from '@/components/settings/editable-block';
import { SettingBlock } from '@/components/settings/setting-block';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/api';
import { useCurrencyFormat } from '@/lib/formats';

export const Route = createFileRoute('/_auth/settings')({
	component: Settings,
});

function Settings() {
	const {
		player: { hunter },
		queryClient,
	} = Route.useRouteContext();
	const { isPending: updatingMoney, mutate: updateMoney } = useMutation(
		trpc.settings.updateMoney.mutationOptions({
			onSuccess({ hideMoney }) {
				queryClient.setQueryData(trpc.auth.me.queryKey(), {
					hunter,
					settings: {
						hideMoney,
					},
				});
			},
		}),
	);
	const { mutate: updateBio } = useMutation(
		trpc.settings.updateBio.mutationOptions(),
	);
	const handleBioChange = useCallback(
		(bio: string) => {
			updateBio({ bio });
		},
		[updateBio],
	);

	const router = useRouter();
	const { isPending: loggingOut, mutate: logOut } = useMutation(
		trpc.auth.logOut.mutationOptions({
			async onSuccess() {
				await router.navigate({ to: '/' });
			},
		}),
	);
	const handleLogOut = useCallback(() => {
		logOut();
	}, [logOut]);

	const money = useCurrencyFormat(hunter?.money ?? 0);

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
					<Button
						className="text-muted-foreground self-start"
						disabled={updatingMoney}
						onClick={() => updateMoney()}
						size="icon"
						variant="ghost"
					>
						{money !== '' ? <Eye /> : <EyeClosed />}
					</Button>
				</SettingBlock>
				<SettingBlock label="Avatar">
					<Avatar hunter={hunter} />
					<AvatarReplaceButton existing={!!hunter.avatar} />
				</SettingBlock>
				<SettingBlock label="Bio">
					<EditableBlock
						multiline
						onChange={handleBioChange}
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
			<Button
				className="w-full"
				disabled={loggingOut}
				onClick={handleLogOut}
				type="submit"
				variant="destructive"
			>
				Log out
			</Button>
		</>
	);
}
