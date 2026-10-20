import { AdminHuntSchema } from '@ihunt/lib/admin-schemas';
import { HUNT_MAX_DANGER, HuntStatus, Locale } from '@ihunt/lib/constants';
import {
	EditIcon,
	EyeClosedIcon,
	EyeIcon,
	PlayIcon,
	SquareIcon,
	TimerResetIcon,
} from 'lucide-react';
import { useCallback, useMemo } from 'react';
import {
	BulkDeleteWithConfirmButton,
	BulkUpdateWithConfirmButton,
	Button,
	ColumnsButton,
	CreateButton,
	DataTable,
	DateField,
	DateInput,
	FilterButton,
	IconButtonWithTooltip,
	Link,
	List,
	NumberInput,
	SearchInput,
	SelectArrayInput,
	TopToolbar,
	useListContext,
	useRecordContext,
	useUpdate,
} from 'react-admin';

import { AdminHuntHunters } from '../components/hunter-list';
import { useTypedDataProvider } from '../data';
import { huntStatusChoices, renderHuntStatus } from './common';
import { HuntCompleteDialog } from './complete-dialog';

export function HuntList() {
	return (
		<List
			filters={listFilters}
			filterDefaultValues={{
				status: [
					{ id: 'pending', name: 'Pending' },
					{ id: 'active', name: 'Active' },
					{ id: 'reviewing', name: 'Reviewing' },
				],
			}}
			actions={<HuntListActions />}
		>
			<DataTable bulkActionButtons={<HuntBulkActions />} rowClick={false}>
				<DataTable.Col source="code" />
				<DataTable.Col source="name" />
				<DataTable.Col source="status" render={renderHuntStatus} />
				<DataTable.Col source="scheduledAt" label="Scheduled for">
					<DateField
						showTime
						locales={Locale}
						emptyText="Not scheduled"
						label="Scheduled for"
						source="scheduledAt"
					/>
				</DataTable.Col>

				<DataTable.NumberCol
					source="payment"
					locales={Locale}
					options={{
						currency: 'EUR',
						maximumFractionDigits: 0,
						style: 'currency',
					}}
				/>
				<DataTable.NumberCol source="danger" />
				<DataTable.Col label="Hunters">
					<AdminHuntHunters />
				</DataTable.Col>
				<DataTable.NumberCol
					source="photoIds"
					label="Photos"
					render={(photoIds: number[]) => photoIds.length}
				/>
				<DataTable.NumberCol source="rating" />
				<DataTable.Col>
					<HuntActions />
				</DataTable.Col>
			</DataTable>
		</List>
	);
}

const listFilters = [
	<SearchInput
		key="search"
		source="q"
		alwaysOn
		className="mt-0! [&_input]:h-8!"
	/>,
	<SelectArrayInput
		alwaysOn
		key="status"
		source="status"
		choices={huntStatusChoices()}
	/>,
	<DateInput key="scheduledAt" source="scheduledAt" />,
	<NumberInput key="danger" max={HUNT_MAX_DANGER} min={1} source="danger" />,
	<NumberInput key="payment" min={0} source="payment" />,
];

function HuntListActions() {
	return (
		<TopToolbar>
			<ColumnsButton />
			<FilterButton />
			<CreateButton />
		</TopToolbar>
	);
}

function HuntActions() {
	const hunt = useRecordContext<AdminHuntSchema>();
	const [update, { isPending }] = useUpdate<AdminHuntSchema>();

	const handleStart = useCallback(() => {
		if (hunt) {
			void update('hunt', {
				data: { status: HuntStatus.Active },
				id: hunt.id,
				previousData: hunt,
			});
		}
	}, [update, hunt]);
	const handleStop = useCallback(() => {
		if (hunt) {
			void update('hunt', {
				data: {
					status: HuntStatus.Reviewing,
					completedAt: hunt.completedAt ?? new Date(),
				},
				id: hunt.id,
				previousData: hunt,
			});
		}
	}, [update, hunt]);

	if (!hunt) {
		return null;
	}
	return (
		<div>
			<Link to={`/hunt/${hunt.id}`}>
				<IconButtonWithTooltip label="Edit">
					<EditIcon />
				</IconButtonWithTooltip>
			</Link>
			{hunt.status === HuntStatus.Available && (
				<IconButtonWithTooltip
					label="Start"
					onClick={handleStart}
					disabled={isPending}
				>
					<PlayIcon />
				</IconButtonWithTooltip>
			)}
			{hunt.status === HuntStatus.Active && (
				<IconButtonWithTooltip
					label="End"
					onClick={handleStop}
					disabled={isPending}
				>
					<SquareIcon />
				</IconButtonWithTooltip>
			)}
			{(hunt.status === HuntStatus.Active ||
				hunt.status === HuntStatus.Reviewing) && <HuntCompleteDialog />}
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

	const { resetInvites } = useTypedDataProvider();
	const handleResetInvites = useCallback(() => {
		if (data?.length) {
			void resetInvites({ huntIds: data.map(({ id }) => id) });
		}
	}, [data, resetInvites]);

	return (
		<>
			{showType && (
				<BulkUpdateWithConfirmButton
					data={{
						status:
							showType === 'hide' ? HuntStatus.Pending : HuntStatus.Available,
					}}
					icon={showType === 'hide' ? <EyeClosedIcon /> : <EyeIcon />}
					label={showType === 'hide' ? 'Hide Hunts' : 'Show Hunts'}
				/>
			)}
			<BulkDeleteWithConfirmButton />

			<Button
				label="Reset invites"
				startIcon={<TimerResetIcon />}
				onClick={handleResetInvites}
			/>
		</>
	);
}
