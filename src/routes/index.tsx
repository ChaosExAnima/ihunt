import { useMutation } from '@tanstack/react-query';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';

import Welcome from '@/components/welcome';
import { trpc } from '@/lib/api';

/* eslint-disable perfectionist/sort-objects */
export const Route = createFileRoute('/')({
	validateSearch(search) {
		if (typeof search.redirect === 'string') {
			return {
				redirect: search.redirect,
			};
		}
		return {};
	},
	async beforeLoad({ context: { queryClient }, search }) {
		try {
			const player = await queryClient.fetchQuery(
				trpc.auth.me.queryOptions(),
			);
			if (player) {
				throw redirect({
					to: search.redirect ?? '/hunts',
				});
			}
		} catch {
			// Nothing
		}
	},
	component: Index,
});
/* eslint-enable perfectionist/sort-objects */

function Index() {
	const router = useRouter();
	const { isPending, mutate } = useMutation(
		trpc.auth.logIn.mutationOptions({
			async onSuccess() {
				await router.navigate({ to: '/hunts' });
			},
		}),
	);
	return <Welcome loggingIn={isPending} logInAction={() => mutate()} />;
}
