import {
	Datagrid,
	List,
	NumberField,
	ReferenceManyField,
	SingleFieldList,
	TextField,
} from 'react-admin';

import { AdminHunterSchema } from '../schemas';

export function UserList() {
	return (
		<List>
			<Datagrid>
				<TextField source="name" />
				<NumberField source="run" />
				<ReferenceManyField<AdminHunterSchema>
					label="Hunters"
					reference="hunter"
					target="userId"
				>
					<SingleFieldList />
				</ReferenceManyField>
			</Datagrid>
		</List>
	);
}
