import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';

import { toArray } from '@/lib/utils';

export function useInvalidate() {
	const queryClient = useQueryClient();
	const router = useRouter();

	const invalidate = useCallback(
		(queries: QueryKey | QueryKey[]) => {
			void Promise.allSettled(
				toArray(queries).map((query) =>
					queryClient.invalidateQueries({
						queryKey: query,
					}),
				),
			).then(() => void router.invalidate());
		},
		[queryClient, router],
	);
	return invalidate;
}
