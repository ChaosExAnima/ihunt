import {
	Datagrid,
	FunctionField,
	ImageField,
	List,
	ReferenceField,
	TextField,
} from 'react-admin';

import { UserRow } from './common';

export function UserList() {
	return (
		<List>
			<Datagrid>
				<ImageField
					label="Avatar"
					source="image"
					sx={{
						'& .RaImageField-image': {
							borderRadius: '50%',
							height: 50,
							overflow: 'hidden',
							width: 50,
						},
					}}
				/>
				<FunctionField<UserRow>
					label="Name"
					render={(record) => record.name ?? record.id}
				/>
				<TextField emptyText="Not set" source="email" />
				<ReferenceField reference="hunter" source="hunter.id" />
			</Datagrid>
		</List>
	);
}
