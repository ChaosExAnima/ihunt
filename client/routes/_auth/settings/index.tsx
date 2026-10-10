import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Eye, EyeClosed } from 'lucide-react';
import { FocusEventHandler, useCallback, useId } from 'react';

import { ActionButton } from '@/client/components/action-button';
import { Avatar } from '@/client/components/avatar';
import { Header } from '@/client/components/header';
import { Loading } from '@/client/components/loading';
import { AvatarReplaceButton } from '@/client/components/settings/avatar-replace';
import { EditableBlock } from '@/client/components/settings/editable-block';
import { SettingBlock } from '@/client/components/settings/setting-block';
import { Button } from '@/client/components/ui/button';
import { Switch } from '@/client/components/ui/switch';
import { useCurrencyFormat } from '@/client/hooks/use-currency-format';
import { useHunter } from '@/client/hooks/use-hunter';
import { useInvalidate } from '@/client/hooks/use-invalidate';
import { useSettings } from '@/client/hooks/use-settings';
import { useTheme } from '@/client/hooks/use-theme';
import { trpc } from '@/client/lib/api';

export const Route = createFileRoute('/_auth/settings/')({
	component: Settings,
	loader({ context: { queryClient } }) {
		void queryClient.prefetchQuery(trpc.hunter.getGroup.queryOptions());
	},
});

function Settings() {
	const hunter = useHunter();
	const invalidate = useInvalidate();
	const [settings, { isPending: updatingSettings, mutate: updateSettings }] =
		useSettings();
	const handleMoneyToggle = useCallback(() => {
		updateSettings({
			hideMoney: !settings?.hideMoney,
		});
	}, [settings?.hideMoney, updateSettings]);

	const { mutate: updateFields, isPending: updatingFields } = useMutation(
		trpc.settings.updateFields.mutationOptions({
			onSuccess() {
				invalidate([
					trpc.auth.me.queryKey(),
					trpc.hunter.getOne.queryKey({ hunterId: hunter?.id }),
				]);
			},
		}),
	);
	const handleBioChange: FocusEventHandler<
		HTMLInputElement | HTMLTextAreaElement
	> = useCallback(
		(event) => {
			const newBio = event.target.value;
			if (newBio !== hunter?.bio) {
				updateFields({ bio: event.target.value });
			}
		},
		[updateFields, hunter?.bio],
	);
	const handlePronounsChange: FocusEventHandler<
		HTMLInputElement | HTMLTextAreaElement
	> = useCallback(
		(event) => {
			const newPronouns = event.target.value;
			if (newPronouns !== hunter?.pronouns) {
				updateFields({ pronouns: event.target.value });
			}
		},
		[updateFields, hunter?.pronouns],
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
			<section className="my-4 grid grid-cols-[auto_1fr] items-center gap-4">
				<SettingBlock label="Name">
					<p>{hunter.name}</p>
				</SettingBlock>
				<SettingBlock label="Handle">
					<p>{hunter.handle}</p>
				</SettingBlock>
				<SettingBlock label="Pronouns" id={`${idBase}-pronouns`}>
					<EditableBlock
						onBlur={handlePronounsChange}
						id={`${idBase}-pronouns`}
						initialValue={hunter.pronouns ?? ''}
						isUpdating={updatingFields}
					/>
				</SettingBlock>
				<SettingBlock label="Cash">
					<div className="grow">
						{money !== '' ? (
							<p className="grow text-xl">{money}</p>
						) : (
							<p className="text-muted grow text-sm italic">Money is hidden</p>
						)}
						{!!money && (
							<p className="text-muted text-xs">
								Payments take 1-2 business days
							</p>
						)}
					</div>
					<ActionButton
						className="text-muted"
						updating={updatingSettings}
						onClick={handleMoneyToggle}
						size="icon"
						variant="ghost"
						icon={money !== '' ? <Eye /> : <EyeClosed />}
					/>
				</SettingBlock>
				<SettingBlock label="Avatar">
					{hunter.avatar && <Avatar hunter={hunter} />}
					<AvatarReplaceButton existing={!!hunter.avatar} />
				</SettingBlock>
				<SettingBlock id={`${idBase}-bio`} label="Bio">
					<EditableBlock
						multiline
						id={`${idBase}-bio`}
						className="field-sizing-content resize-none"
						placeholder="Tell us about yourself!"
						initialValue={hunter.bio ?? ''}
						onBlur={handleBioChange}
						isUpdating={updatingFields}
					/>
				</SettingBlock>
				<SettingBlock id={`${idBase}-theme`} label="Light Mode">
					<Switch
						checked={theme === 'light'}
						id={`${idBase}-theme`}
						onCheckedChange={toggleTheme}
					/>
				</SettingBlock>
			</section>
			<Button asChild variant="secondary" className="mt-auto">
				<Link to="/settings/notifications">Notifications Settings</Link>
			</Button>
			<ActionButton
				className="w-full"
				updating={loggingOut}
				onClick={handleLogOut}
				type="submit"
				variant="destructive"
			>
				Log out
			</ActionButton>
			<Link to="/debug" className="text-muted text-sm">
				Debug info
			</Link>
		</>
	);
}
