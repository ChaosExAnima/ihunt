import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Eye, EyeClosed } from 'lucide-react';
import { useCallback, useId } from 'react';

import Avatar from '@/components/avatar';
import Header from '@/components/header';
import { HunterGroupList } from '@/components/hunter/group-list';
import { Loading } from '@/components/loading';
import { Rating } from '@/components/rating';
import { AvatarReplaceButton } from '@/components/settings/avatar-replace';
import { EditableBlock } from '@/components/settings/editable-block';
import { SettingBlock } from '@/components/settings/setting-block';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useHunter } from '@/hooks/use-hunter';
import { useInvalidate } from '@/hooks/use-invalidate';
import { useTheme } from '@/hooks/use-theme';
import { trpc } from '@/lib/api';
import { useCurrencyFormat } from '@/lib/formats';

export const Route = createFileRoute('/_auth/settings')({
	component: Settings,
	loader({ context: { queryClient } }) {
		void queryClient.prefetchQuery(trpc.hunter.getGroup.queryOptions());
	},
});

function Settings() {
	const hunter = useHunter();
	const invalidate = useInvalidate();
	const { isPending: updatingMoney, mutate: updateMoney } = useMutation(
		trpc.settings.updateMoney.mutationOptions({
			onSuccess() {
				invalidate([
					trpc.auth.me.queryKey(),
					trpc.hunter.getOne.queryKey(),
				]);
			},
		}),
	);
	const handleMoneyToggle = useCallback(() => {
		updateMoney();
	}, [updateMoney]);

	const { mutate: updateFields } = useMutation(
		trpc.settings.updateFields.mutationOptions({
			onSuccess() {
				invalidate([
					trpc.auth.me.queryKey(),
					trpc.hunter.getOne.queryKey(),
				]);
			},
		}),
	);
	const handleBioChange = useCallback(
		(bio: string) => {
			updateFields({ bio });
		},
		[updateFields],
	);
	const handlePronounsChange = useCallback(
		(pronouns: string) => {
			updateFields({ pronouns });
		},
		[updateFields],
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

	const { theme, toggleTheme } = useTheme();

	const idBase = useId();

	if (!hunter) {
		return <Loading />;
	}

	return (
		<>
			<Header>Settings</Header>
			<section className="grid grid-cols-[auto_1fr] gap-4 items-center my-4">
				<SettingBlock label="Name">
					<p>{hunter.name}</p>
				</SettingBlock>
				<SettingBlock label="Handle">
					<p>{hunter.handle}</p>
				</SettingBlock>
				<SettingBlock label="Pronouns">
					<EditableBlock
						onChange={handlePronounsChange}
						value={hunter.pronouns ?? ''}
					/>
				</SettingBlock>
				<SettingBlock className="flex-col items-start" label="Rating">
					<Rating max={5} rating={hunter.rating} />
					{hunter.rating <= 1 && (
						<p className="text-xs text-accent">
							Your rating is low! Boost it with more jobs or your
							account may be terminated.
						</p>
					)}
					{hunter.rating > 4 && (
						<p className="text-xs text-success">
							You are one of our top hunters!
						</p>
					)}
				</SettingBlock>
				<SettingBlock label="Cash">
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
						onClick={handleMoneyToggle}
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
				<SettingBlock id={`${idBase}-theme`} label="Light Mode">
					<Switch
						checked={theme === 'light'}
						id={`${idBase}-theme`}
						onCheckedChange={toggleTheme}
					/>
				</SettingBlock>
				<SettingBlock label="Friends">
					<HunterGroupList />
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
