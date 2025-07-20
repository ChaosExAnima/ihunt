import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { HuntDisplay } from '@/components/hunt';
import { trpc } from '@/lib/api';

export const Route = createFileRoute('/hunts/$huntId')({
	component: RouteComponent,
	async loader({ context: { queryClient }, params: { huntId } }) {
		await queryClient.ensureQueryData(
			trpc.hunt.fetchHunt.queryOptions({ huntId }),
		);
	},
});

function RouteComponent() {
	const { huntId } = Route.useParams();
	const { data: hunt } = useQuery(
		trpc.hunt.fetchHunt.queryOptions({ huntId }),
	);
	if (!hunt) {
		return null;
	}
	return <HuntDisplay className="h-full" hunt={hunt} hunterId={hunter.id} />;
}
