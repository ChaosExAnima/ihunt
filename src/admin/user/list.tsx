import {
	BulkDeleteWithConfirmButton,
	DataTable,
	List,
	ReferenceOneField,
	TextField,
} from 'react-admin';

import { AdminAvatar } from '../components/avatar';
import { AdminHunterSchema } from '../schemas';
import { MessageDialog } from './message-dialog';

export function UserList() {
	return (
		<List>
			<DataTable bulkActionButtons={<BulkActionButtons />}>
				<DataTable.NumberCol source="id" width="2rem" />
				<DataTable.Col
					source="code"
					className="uppercase"
					width="4rem"
				/>
				<DataTable.NumberCol source="run" width="2rem" />
				<DataTable.Col label="Hunter">
					<ReferenceOneField<AdminHunterSchema>
						reference="hunter"
						target="userId"
					>
						<div className="flex items-center gap-4">
							<AdminAvatar />
							<TextField source="handle" />
						</div>
					</ReferenceOneField>
				</DataTable.Col>
			</DataTable>
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
