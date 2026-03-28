import { useQuery } from '@tanstack/react-query';

import { trpc } from '@/lib/api';

import { HunterList } from './hunter-list';

interface HunterGroupListProps {
	hunterId?: number;
}

export function HunterGroupList({ hunterId }: HunterGroupListProps) {
	const { data: group } = useQuery({
		...trpc.hunter.getGroup.queryOptions({
			hunterId,
		}),
	});
	const groupHunters = group?.hunters ?? [];

	if (groupHunters.length === 0) {
		return null;
	}
	return <HunterList hunters={groupHunters} />;
}
