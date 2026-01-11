import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/settings/notifications')({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_auth/settings/notifications"!</div>;
}
