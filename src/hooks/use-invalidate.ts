import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';

export function useInvalidate() {
	const queryClient = useQueryClient();
	const router = useRouter();

	const invalidate = useCallback(
		(queries: QueryKey[]) => {
			void Promise.allSettled(
				queries.map((query) =>
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
