import { AvatarEmpty, AvatarLocked } from '@ihunt/client/components/avatar';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@ihunt/client/components/ui/tooltip';
import {
	AdminHunterSchema,
	AdminHuntSchema,
	AdminSpotSchema,
} from '@ihunt/lib/admin-schemas';
import {
	ChipField,
	Link,
	RecordContextProvider,
	ReferenceField,
	useCreatePath,
	useListContext,
	useRecordContext,
} from 'react-admin';

import { AdminAvatar } from './avatar';

export function AdminHunter() {
	const hunter = useRecordContext<AdminHunterSchema>();
	const createPath = useCreatePath();
	if (!hunter) {
		return null;
	}
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Link
						to={createPath({
							id: hunter.id,
							resource: 'hunter',
							type: 'edit',
						})}
					>
						<AdminAvatar />
					</Link>
				</TooltipTrigger>
				<TooltipContent>{hunter.handle}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export function AdminHunters({ withName = false }: { withName?: boolean }) {
	const context = useListContext<AdminHunterSchema>();
	const hunters = context?.data ?? [];
	const createPath = useCreatePath();
	if (!hunters.length) {
		return null;
	}

	return (
		<ul className="flex gap-2">
			{hunters.map((hunter) => (
				<li key={hunter.id}>
					<RecordContextProvider value={hunter}>
						{!withName && <AdminHunter />}
						{withName && (
							<Link
								to={createPath({
									id: hunter.id,
									resource: 'hunter',
									type: 'edit',
								})}
							>
								<ChipField icon={<AdminAvatar size={30} />} source="handle" />
							</Link>
						)}
					</RecordContextProvider>
				</li>
			))}
		</ul>
	);
}

export function AdminHuntSpots() {
	const record = useRecordContext<AdminHuntSchema>();
	if (!record) {
		return null;
	}

	return (
		<ul className="flex gap-2">
			{record.spots.map((spot) => (
				<li key={spot.id}>
					<AdminSpotAvatar spot={spot} />
				</li>
			))}
		</ul>
	);
}

function AdminSpotAvatar({ spot }: { spot: AdminSpotSchema }) {
	switch (spot.status) {
		case 'empty':
			return <AvatarEmpty />;
		case 'locked':
			return <AvatarLocked />;
		case 'taken':
			return (
				<RecordContextProvider value={spot}>
					<ReferenceField source="hunterId" reference="hunter" link={false}>
						<AdminHunter />
					</ReferenceField>
				</RecordContextProvider>
			);
	}
}
