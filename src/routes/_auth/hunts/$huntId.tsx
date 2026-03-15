import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { HuntDisplay } from '@/components/hunt';
import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { useAvailableHunt } from '@/hooks/use-available-hunt';
import { trpc } from '@/lib/api';

export const Route = createFileRoute('/_auth/hunts/$huntId')({
	component: RouteComponent,
	loader({ context: { queryClient }, params: { huntId } }) {
		void queryClient.prefetchQuery(
			trpc.hunt.getOne.queryOptions({ huntId }),
		);
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
