import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { HuntDisplay } from '@/components/hunt';
import { Button } from '@/components/ui/button';
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
	return (
		<>
			<HuntDisplay className="h-full grow" hunt={hunt} />
			<Button asChild variant="secondary">
				<Link to="/hunts">
					<ArrowLeft />
					Back
				</Link>
			</Button>
		</>
	);
}
