import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';

import { Avatar } from '@/components/avatar';
import { Header } from '@/components/header';
import { Loading } from '@/components/loading';
import { Rating } from '@/components/rating';
import { trpc } from '@/lib/api';

export const Route = createFileRoute('/_auth/hunters/')({
	component: RouteComponent,
	loader({ context: { queryClient } }) {
		void queryClient.prefetchQuery(trpc.hunter.getList.queryOptions());
	},
});

function RouteComponent() {
	const { isLoading, data: hunters } = useQuery(
		trpc.hunter.getList.queryOptions(),
	);
	if (isLoading || !hunters) {
		return <Loading />;
	}
	return (
		<>
			<Header level={1} variant={2} className="mb-2">
				Top hunters in Cologne
			</Header>

			<ol>
				{hunters.map((hunter) => (
					<li key={hunter.id} className="mb-2 last:mb-0">
						<Link
							to="/hunters/$hunterId"
							params={{ hunterId: hunter.id.toString() }}
							className="flex items-center gap-2"
						>
							<Avatar hunter={hunter} />
							<span className="grow">{hunter.handle}</span>
							<Rating fill rating={hunter.rating} size="1.2em" />
						</Link>
					</li>
				))}
			</ol>
		</>
	);
}
