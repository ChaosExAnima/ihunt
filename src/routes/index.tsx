import { useMutation } from '@tanstack/react-query';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';

import Welcome from '@/components/welcome';
import { trpc } from '@/lib/api';

export const Route = createFileRoute('/')({
	beforeLoad({ context }) {
		if (context.settings) {
			throw redirect({
				to: '/hunts',
			});
		}
	},
	component: Index,
});

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
