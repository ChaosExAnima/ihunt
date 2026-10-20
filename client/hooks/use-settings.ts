import { useMutation } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';

import { trpc } from '@/lib/api';

import { useInvalidate } from './use-invalidate';

export function useSettings() {
	const { settings } = useRouteContext({ from: '/_auth' });
	const invalidate = useInvalidate();
	const updateMutation = useMutation(
		trpc.settings.updateSettings.mutationOptions({
			onSuccess() {
				invalidate(trpc.auth.me.queryKey());
			},
		}),
	);
	return [settings, updateMutation] as const;
}
