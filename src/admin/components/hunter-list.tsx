import {
	ChipField,
	Link,
	RecordContextProvider,
	useCreatePath,
	useListContext,
	useRecordContext,
} from 'react-admin';

import { AvatarEmpty } from '@/components/avatar';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { arrayOfLength } from '@/lib/utils';

import { AdminHunterSchema, AdminHuntSchema } from '../schemas';
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
								<ChipField
									icon={<AdminAvatar size={30} />}
									source="handle"
								/>
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
					<AvatarEmpty />
				</li>
			))}
		</ul>
	);
}
