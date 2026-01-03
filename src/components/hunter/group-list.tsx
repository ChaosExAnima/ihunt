import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { trpc } from '@/lib/api';

import { HunterList } from './hunter-list';

interface HunterGroupListProps {
	children?: ReactNode;
	hunterId?: number;
}

export function HunterGroupList({ children, hunterId }: HunterGroupListProps) {
	const { data: group } = useQuery({
		...trpc.hunter.getGroup.queryOptions({
			hunterId,
		}),
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
