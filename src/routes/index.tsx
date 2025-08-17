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
	beforeLoad({ context, search }) {
		if (context.me) {
			throw redirect({
				to: search.redirect ?? '/hunts',
			});
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
