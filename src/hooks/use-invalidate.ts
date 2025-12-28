import { QueryClient, QueryKey, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export async function invalidateQueries(
	queries: QueryKey[],
	queryClient: QueryClient,
) {
	return Promise.allSettled(
		queries.map((query) =>
			queryClient.invalidateQueries({
				queryKey: query,
			}),
		),
	);
}

export function useInvalidate() {
	const queryClient = useQueryClient();

	const invalidate = useCallback(
		(queries: QueryKey[]) => {
			void invalidateQueries(queries, queryClient);
		},
		[queryClient],
	);
	return invalidate;
}
