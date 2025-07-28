import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/hunts/')({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/hunts/"!</div>;
}
