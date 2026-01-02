import {
	BulkDeleteWithConfirmButton,
	Datagrid,
	List,
	NumberField,
	ReferenceManyField,
	SingleFieldList,
	TextField,
} from 'react-admin';

import { AdminHunterSchema } from '../schemas';
import { MessageDialog } from './message-dialog';

export function UserList() {
	return (
		<List>
			<Datagrid bulkActionButtons={<BulkActionButtons />}>
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

function BulkActionButtons() {
	return (
		<>
			<BulkDeleteWithConfirmButton />
			<MessageDialog />
		</>
	);
}
