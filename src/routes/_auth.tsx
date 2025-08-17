import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
	beforeLoad({ context, location }) {
		if (!context.me) {
			throw redirect({ search: { redirect: location.href }, to: '/' });
		}
	},
	component: () => <Outlet />,
});
