import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
	beforeLoad({ context, location }) {
		if (!context.user) {
			// console.log('inside _auth', context);
			throw redirect({ search: { redirect: location.href }, to: '/' });
		}
	},
});
