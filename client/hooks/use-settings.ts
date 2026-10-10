import { useMutation } from '@tanstack/react-query';

import { PlayerInfo, usePlayer } from '@/components/providers/player';
import { trpc } from '@/lib/api';

import { useInvalidate } from './use-invalidate';

export function useSettings() {
	const invalidate = useInvalidate();
	const updateMutation = useMutation(
		trpc.settings.updateSettings.mutationOptions({
			onSuccess() {
				invalidate(trpc.auth.me.queryKey());
			},
		}),
	);
	return [usePlayer()?.settings, updateMutation] as [
		PlayerInfo['settings'],
		typeof updateMutation,
	];
}
