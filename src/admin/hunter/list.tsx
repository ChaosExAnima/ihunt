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
	TextField,
	useRecordContext,
} from 'react-admin';

import { HunterTypeIcon } from '@/components/hunter/type-icon';
import { Locale } from '@/lib/constants';
import { roundToHalves } from '@/lib/formats';

import { AdminAvatar } from '../components/avatar';
import { AdminHunterSchema } from '../schemas';
import { MoneyDialog } from './money-dialog';

const listFilters = [
	<SearchInput alwaysOn key="1" source="name" />,
	<BooleanInput
		className="h-12 flex flex-col justify-center"
		key="2"
		source="alive"
	/>,
	<ReferenceInput key="3" reference="group" source="groupId" />,
];

export function HunterList() {
	const renderType = useCallback(
		(record: AdminHunterSchema) => <HunterTypeIcon type={record.type} />,
		[],
	);
	return (
		<List filters={listFilters}>
			<Datagrid rowClick={false} sort={{ field: 'id', order: 'ASC' }}>
				<TextField source="id" />
				<TextField source="name" />
				<TextField source="handle" />
				<ReferenceField
					empty={<em className="text-stone-400">No group</em>}
					reference="group"
					source="groupId"
				/>
				<AdminAvatar label="Avatar" />
				<FunctionField label="Type" render={renderType} />
				<ReferenceField reference="user" source="userId" />
				<NumberField
					label="Rating"
					sortable={false}
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
