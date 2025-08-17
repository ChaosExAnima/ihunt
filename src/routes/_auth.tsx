import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
	beforeLoad({ context, location }) {
		console.log('auth check:', context, location);

		if (!context.me?.hunter) {
			throw redirect({ search: { redirect: location.href }, to: '/' });
		}
	},
	component: () => <Outlet />,
});
