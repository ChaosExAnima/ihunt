import { HuntSchema, SpotSchema } from '@ihunt/lib/schemas';
import { useQuery } from '@tanstack/react-query';

import { trpc } from '@/lib/api';

import { Avatar, AvatarEmpty, AvatarLocked } from '../avatar';

export function HuntSpotsDisplay({
	spots = [],
}: Partial<Pick<HuntSchema, 'spots'>>) {
	return (
		<div className="flex items-center gap-2 text-sm">
			<p>Hunters:</p>
			<ul className="flex gap-2">
				{spots.map((spot, index) => (
					<li key={index}>
						<SpotDisplay spot={spot} />
					</li>
				))}
			</ul>
		</div>
	);
}

function SpotDisplay({ spot }: { spot: SpotSchema }) {
	const hunterId = spot.state === 'empty' ? null : spot.hunterId;
	const { data } = useQuery(trpc.hunter.getOne.queryOptions({ hunterId }));
	switch (spot.state) {
		case 'empty':
			return <AvatarEmpty />;
		case 'locked':
			return <AvatarLocked />;
		case 'taken':
			return data ? <Avatar hunter={data} link /> : null;
	}
}
