import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { HuntDisplay } from '@/components/hunt';
import { trpc } from '@/lib/api';

export const Route = createFileRoute('/_auth/hunts/$huntId')({
	component: RouteComponent,
	async loader({ context: { queryClient }, params: { huntId } }) {
		await queryClient.ensureQueryData(
			trpc.hunt.getOne.queryOptions({ huntId }),
		);
	},
});

function RouteComponent() {
	const { huntId } = Route.useParams();
	const { player } = Route.useRouteContext();
	const { data: hunt } = useQuery(trpc.hunt.getOne.queryOptions({ huntId }));
	if (!hunt || !player?.hunter) {
		return null;
	}
	return <HuntDisplay className="h-full" hunt={hunt} />;
}
