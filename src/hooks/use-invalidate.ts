import { QueryClient, QueryKey, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

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

export function useInvalidate(queries: (() => QueryKey[]) | QueryKey[]) {
	const queryClient = useQueryClient();

	const [queriesResult] = useState(queries);

	const invalidate = useCallback(() => {
		void invalidateQueries(queriesResult, queryClient);
	}, [queriesResult, queryClient]);
	return invalidate;
}
