import {
	DataTable,
	EditButton,
	List,
	ReferenceArrayField,
	SearchInput,
} from 'react-admin';

import { AdminHunters } from '../components/hunter-list';

export function GroupList() {
	return (
		<List filters={[<SearchInput source="q" alwaysOn />]}>
			<DataTable bulkActionButtons={false} rowClick={false}>
				<DataTable.NumberCol source="id" width="2rem" />
				<DataTable.Col source="name" />
				<DataTable.Col source="hunterIds" label="Hunters" disableSort>
					<ReferenceArrayField
						reference="hunter"
						sortable={false}
						source="hunterIds"
					>
						<AdminHunters />
					</ReferenceArrayField>
				</DataTable.Col>
				<DataTable.Col>
					<EditButton />
				</DataTable.Col>
			</DataTable>
		</List>
	);
}
