import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { apiDebug, trpc } from '@/lib/api';

export const Route = createFileRoute('/debug')({
	component: RouteComponent,
});

const none = <em className="text-muted">None</em>;

function RouteComponent() {
	const { data } = useQuery(trpc.auth.me.queryOptions());
	const { lanServer, lanWorking } = useMemo(apiDebug, []);

	const { queryClient } = Route.useRouteContext();
	const { isPending: loggingOut, mutate: logOut } = useMutation(
		trpc.auth.logOut.mutationOptions({
			onSuccess() {
				queryClient.removeQueries({ queryKey: trpc.auth.pathKey() });
			},
		}),
	);
	const handleLogOut = useCallback(() => {
		logOut();
	}, [logOut]);

	return (
		<main className="flex grow flex-col gap-4 p-4">
			<Header>Debug information</Header>
			<ul className="grow">
				<li>Build: {window.__IHUNT_VERSION__ ?? 'Unknown'}</li>
				<li>LAN Server: {lanServer ?? none}</li>
				<li>LAN Active: {lanWorking ? 'Yes' : 'No'}</li>
				<li>Hunter ID: {data?.hunter.id ?? none}</li>
			</ul>
			{data && (
				<Button
					variant="destructive"
					disabled={loggingOut}
					onClick={handleLogOut}
				>
					Log out
				</Button>
			)}
			<Button variant="secondary" asChild>
				<Link to="/">Back</Link>
			</Button>
		</main>
	);
}
