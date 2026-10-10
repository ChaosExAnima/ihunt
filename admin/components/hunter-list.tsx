import { AvatarEmpty, AvatarLocked } from '@ihunt/client/components/avatar';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@ihunt/client/components/ui/tooltip';
import { AdminHunterSchema, AdminHuntSchema } from '@ihunt/lib/admin-schemas';
import { arrayOfLength } from '@ihunt/lib/utils';
import {
	ChipField,
	Link,
	RecordContextProvider,
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

export function AdminHuntHunters() {
	const context = useListContext<AdminHunterSchema>();
	const record = useRecordContext<AdminHuntSchema>();
	if (!record) {
		return null;
	}

	const hunters = context?.data ?? [];

	const slots = arrayOfLength(record.maxHunters - hunters.length);
	return (
		<ul className="flex gap-2">
			{hunters.map((hunter) => (
				<li key={hunter.id}>
					<RecordContextProvider value={hunter}>
						<AdminHunter />
					</RecordContextProvider>
				</li>
			))}
			{slots.map((_, index) => (
				<li key={index}>
					{record.reserved ? <AvatarLocked /> : <AvatarEmpty />}
				</li>
			))}
		</ul>
	);
}
