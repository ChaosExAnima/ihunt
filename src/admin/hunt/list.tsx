import { Edit, EyeClosedIcon, EyeIcon, Play } from 'lucide-react';
import { useMemo } from 'react';
import {
	BulkDeleteWithConfirmButton,
	BulkUpdateWithConfirmButton,
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
	useListContext,
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
				bulkActionButtons={<HuntBulkActions />}
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

function HuntBulkActions() {
	const { data, selectedIds } = useListContext<AdminHuntSchema>();
	const showType = useMemo(() => {
		if (!data || data.length === 0 || selectedIds.length === 0) {
			return null;
		}

		for (const hunt of data) {
			if (!selectedIds.includes(hunt.id)) {
				continue;
			}
			if (hunt.status === HuntStatus.Available) {
				return 'hide';
			} else if (hunt.status === HuntStatus.Pending) {
				return 'show';
			}
		}
		return null;
	}, [data, selectedIds]);

	return (
		<>
			{showType && (
				<BulkUpdateWithConfirmButton
					data={{
						status:
							showType === 'hide'
								? HuntStatus.Pending
								: HuntStatus.Available,
					}}
					icon={showType === 'hide' ? <EyeClosedIcon /> : <EyeIcon />}
					label={showType === 'hide' ? 'Hide Hunts' : 'Show Hunts'}
				/>
			)}
			<BulkDeleteWithConfirmButton />
		</>
	);
}
