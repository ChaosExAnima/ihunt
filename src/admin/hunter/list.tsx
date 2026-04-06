import { EditIcon } from 'lucide-react';
import { useCallback } from 'react';
import {
	BooleanField,
	BooleanInput,
	Datagrid,
	FunctionField,
	IconButtonWithTooltip,
	Link,
	List,
	NumberField,
	ReferenceArrayField,
	ReferenceField,
	ReferenceInput,
	SearchInput,
	SelectArrayInput,
	TextField,
	useRecordContext,
} from 'react-admin';

import { HunterTypeIcon } from '@/components/hunter/type-icon';
import { Locale } from '@/lib/constants';
import { roundToHalves } from '@/lib/formats';

import { AdminAvatar } from '../components/avatar';
import { AdminHunterSchema } from '../schemas';
import { hunterTypeChoices } from './common';
import { MoneyDialog } from './money-dialog';

const listFilters = [
	<SearchInput
		alwaysOn
		key="1"
		source="q"
		className="mt-0! [&_input]:h-8!"
	/>,
	<SelectArrayInput choices={hunterTypeChoices} source="type" />,
	<BooleanInput
		className="flex h-12 flex-col justify-center"
		key="2"
		source="alive"
	/>,
	<ReferenceInput
		key="3"
		reference="group"
		source="groupId"
		sort={{ field: 'name', order: 'ASC' }}
	/>,
];

export function HunterList() {
	const renderType = useCallback(
		(record: AdminHunterSchema) => <HunterTypeIcon type={record.type} />,
		[],
	);
	return (
		<List filters={listFilters}>
			<Datagrid rowClick={false}>
				<TextField source="id" />
				<ReferenceField
					reference="user"
					sortable={false}
					source="userId"
					empty={<em className="text-muted">None</em>}
				/>
				<TextField source="name" emptyText="No name" />
				<TextField source="handle" />
				<ReferenceField
					empty={<em className="text-muted">No group</em>}
					reference="group"
					sortable={false}
					source="groupId"
				/>
				<AdminAvatar label="Avatar" />
				<FunctionField label="Type" render={renderType} sortBy="type" />
				<NumberField
					label="Rating"
					source="rating"
					transform={roundToHalves}
				/>
				<NumberField
					locales={Locale}
					options={{
						currency: 'EUR',
						maximumFractionDigits: 0,
						style: 'currency',
					}}
					source="money"
					textAlign="left"
				/>
				<BooleanField source="alive" />
				<ReferenceArrayField
					label="Hunts"
					reference="hunt"
					sortable={false}
					source="huntIds"
				/>
				<HunterActions />
			</Datagrid>
		</List>
	);
}

function HunterActions() {
	const hunter = useRecordContext<AdminHunterSchema>();

	if (!hunter?.alive) {
		return null;
	}

	return (
		<>
			<Link to={`/hunter/${hunter.id}`}>
				<IconButtonWithTooltip label="Edit">
					<EditIcon />
				</IconButtonWithTooltip>
			</Link>
			<MoneyDialog />
		</>
	);
}
