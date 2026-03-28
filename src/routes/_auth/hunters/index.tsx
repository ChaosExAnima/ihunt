import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/hunters/')({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_auth/hunters/"!</div>;
}
