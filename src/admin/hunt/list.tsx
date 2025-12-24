import { Edit, Play } from 'lucide-react';
import {
	Datagrid,
	DateField,
	FunctionField,
	IconButtonWithTooltip,
	Link,
	List,
	NumberField,
	ReferenceArrayField,
	SelectArrayInput,
	TextField,
	useRecordContext,
	useUpdate,
} from 'react-admin';

import { HuntStatus, Locale } from '@/lib/constants';

import { AdminHunterList } from '../components/hunter-list';
import { AdminHuntSchema } from '../schemas';
import { huntStatusChoices, renderHuntStatus } from './common';
import HuntCompleteDialog from './complete-dialog';

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
				<ReferenceArrayField reference="hunter" source="hunterIds">
					<AdminHunterList />
				</ReferenceArrayField>
				<HuntActions />
			</Datagrid>
		</List>
	);
}

export const listFilters = [
	<SelectArrayInput
		alwaysOn
		choices={huntStatusChoices()}
		key="1"
		source="status"
	/>,
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
