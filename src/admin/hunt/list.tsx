'use client';
import { Edit, Play } from 'lucide-react';
import {
	Datagrid,
	DateField,
	FunctionField,
	IconButtonWithTooltip,
	Link,
	List,
	NumberField,
	SelectArrayInput,
	TextField,
	useRecordContext,
	useUpdate,
} from 'react-admin';

import HunterList from '@/components/hunter-list';
import { HuntStatus, Locale } from '@/lib/constants';
import { HuntSchema } from '@/lib/schemas';

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
				<FunctionField
					render={(record: HuntSchema) => (
						<HunterList
							hunters={record.hunters ?? []}
							max={record.maxHunters}
						/>
					)}
					source="hunters"
				/>
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
	const hunt = useRecordContext<HuntSchema>();
	const [update, { isPending }] = useUpdate<HuntSchema>();

	if (!hunt) {
		return null;
	}

	const handleStart = () => {
		update('hunt', {
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
