import { useQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { isTRPCClientError } from '@trpc/client';

import { BackButton } from '@/components/back-button';
import { HuntDisplay } from '@/components/hunt';
import { Loading } from '@/components/loading';
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
			<BackButton />
			{inviteModal}
		</>
	);
}
