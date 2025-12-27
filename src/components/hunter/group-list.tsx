import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { trpc } from '@/lib/api';

import { HunterList } from '../hunter-list';

interface HunterGroupListProps {
	children?: ReactNode;
	groupId?: null | number;
}

export function HunterGroupList({ children, groupId }: HunterGroupListProps) {
	const { data: group } = useQuery({
		...trpc.hunter.getGroup.queryOptions({
			id: groupId,
		}),
		enabled: !!groupId || groupId === null, // Null means get the current hunter group.
	});
	const groupHunters = group?.hunters ?? [];

	if (groupHunters.length === 0) {
		return null;
	}
	return (
		<>
			{children}
			<HunterList hunters={groupHunters} />
		</>
	);
}
