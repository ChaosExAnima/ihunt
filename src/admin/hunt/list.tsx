import { Edit, Play } from 'lucide-react';
import {
	Datagrid,
	DateField,
	FunctionField,
	IconButtonWithTooltip,
	Link,
	List,
	NumberField,
	NumberInput,
	ReferenceArrayField,
	SelectArrayInput,
	TextField,
	useRecordContext,
	useUpdate,
} from 'react-admin';

import { HUNT_MAX_DANGER, HuntStatus, Locale } from '@/lib/constants';

import { AdminHuntHunters } from '../components/hunter-list';
import { AdminHuntSchema } from '../schemas';
import { huntStatusChoices, renderHuntStatus } from './common';
import { HuntCompleteDialog } from './complete-dialog';

export function HuntList() {
	return (
		<List filters={listFilters}>
			<Datagrid
				bulkActionButtons={false}
				rowClick={false}
				sort={{ field: 'id', order: 'ASC' }}
			>
				<NumberField source="id" />
				<TextField source="name" />
				<FunctionField render={renderHuntStatus} source="status" />
				<DateField
					emptyText="Not scheduled"
					label="Scheduled for"
					source="scheduledAt"
				/>
				<NumberField
					locales={Locale}
					options={{
						currency: 'EUR',
						maximumFractionDigits: 0,
						style: 'currency',
					}}
					source="payment"
				/>
				<NumberField source="danger" />
				<NumberField source="minRating" />
				<ReferenceArrayField
					reference="hunter"
					sortable={false}
					source="hunterIds"
				>
					<AdminHuntHunters />
				</ReferenceArrayField>
				<NumberField
					label="Photos"
					sortable={false}
					source="photoIds"
					transform={(photoIds: number[]) => photoIds.length}
				/>
				<HuntActions />
			</Datagrid>
		</List>
	);
}

const listFilters = [
	<SelectArrayInput
		alwaysOn
		choices={huntStatusChoices()}
		key="1"
		source="status"
	/>,
	<NumberInput key="2" max={HUNT_MAX_DANGER} min={1} source="danger" />,
];

function HuntActions() {
	const hunt = useRecordContext<AdminHuntSchema>();
	const [update, { isPending }] = useUpdate<AdminHuntSchema>();

	if (!hunt) {
		return null;
	}

	const handleStart = () => {
		void update('hunt', {
			data: { status: HuntStatus.Active },
			id: hunt.id,
			previousData: hunt,
		});
	};
	return (
		<div>
			<Link to={`/hunt/${hunt.id}`}>
				<IconButtonWithTooltip label="Edit">
					<Edit />
				</IconButtonWithTooltip>
			</Link>
			{hunt.status === HuntStatus.Available && (
				<IconButtonWithTooltip
					disabled={isPending}
					label="Start"
					onClick={handleStart}
				>
					<Play />
				</IconButtonWithTooltip>
			)}
			{hunt.status === HuntStatus.Active && <HuntCompleteDialog />}
		</div>
	);
}
