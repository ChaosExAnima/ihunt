import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { isTRPCClientError } from '@trpc/client';
import { ArrowLeft } from 'lucide-react';

import { HuntDisplay } from '@/components/hunt';
import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { useAvailableHunt } from '@/hooks/use-available-hunt';
import { trpc } from '@/lib/api';

export const Route = createFileRoute('/_auth/hunts/$huntId')({
	component: RouteComponent,
	async loader({ context: { queryClient }, params: { huntId } }) {
		try {
			await queryClient.fetchQuery(
				trpc.hunt.getOne.queryOptions({ huntId }),
			);
		} catch (err) {
			if (isTRPCClientError(err)) {
				if (err.message === 'NOT_FOUND') {
					throw notFound();
				}
			}
			throw err;
		}
	},
});

function RouteComponent() {
	const { huntId } = Route.useParams();
	const { data: hunt } = useQuery(trpc.hunt.getOne.queryOptions({ huntId }));

	const { remainingToday, onJoin, inviteModal } = useAvailableHunt();

	if (!hunt) {
		return <Loading />;
	}

	return (
		<>
			<HuntDisplay
				className="h-full grow"
				hunt={hunt}
				onAcceptHunt={onJoin}
				remainingHunts={remainingToday}
			/>
			<Button asChild variant="secondary">
				<Link to="/hunts">
					<ArrowLeft />
					Back
				</Link>
			</Button>
			{inviteModal}
		</>
	);
}
