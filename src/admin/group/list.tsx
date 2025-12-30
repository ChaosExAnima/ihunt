import {
	Datagrid,
	List,
	NumberField,
	ReferenceArrayField,
	TextField,
} from 'react-admin';

import { AdminHunters } from '../components/hunter-list';

export function GroupList() {
	return (
		<List>
			<Datagrid
				bulkActionButtons={false}
				sort={{ field: 'name', order: 'ASC' }}
			>
				<NumberField source="id" />
				<TextField source="name" />
				<ReferenceArrayField
					reference="hunter"
					sortable={false}
					source="hunterIds"
				>
					<AdminHunters />
				</ReferenceArrayField>
			</Datagrid>
		</List>
	);
}
