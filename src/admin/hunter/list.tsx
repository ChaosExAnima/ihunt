import { useCallback } from 'react';
import {
	BooleanField,
	Datagrid,
	FunctionField,
	List,
	NumberField,
	ReferenceArrayField,
	ReferenceField,
	SearchInput,
	TextField,
} from 'react-admin';

import { HunterTypeIcon } from '@/components/hunter/type-icon';
import { Locale } from '@/lib/constants';

import { AdminAvatar } from '../components/avatar';
import { AdminHunterSchema } from '../schemas';

const listFilters = [<SearchInput alwaysOn key="1" source="name" />];

export function HunterList() {
	const renderType = useCallback(
		(record: AdminHunterSchema) => <HunterTypeIcon type={record.type} />,
		[],
	);
	return (
		<List filters={listFilters}>
			<Datagrid
				bulkActionButtons={false}
				sort={{ field: 'id', order: 'ASC' }}
			>
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
				<NumberField label="Rating" sortable={false} source="rating" />
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
					source="huntIds"
				/>
			</Datagrid>
		</List>
	);
}
