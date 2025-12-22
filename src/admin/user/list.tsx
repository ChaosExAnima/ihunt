import {
	ChipField,
	Datagrid,
	FunctionField,
	List,
	ReferenceManyField,
	SingleFieldList,
} from 'react-admin';

import Avatar from '@/components/avatar';

import { UserRow } from './common';

export function UserList() {
	return (
		<List>
			<Datagrid>
				<FunctionField<UserRow>
					label="Avatar"
					render={(record) => {
						const hunter = record.hunters.at(0);
						return hunter && <Avatar hunter={hunter} />;
					}}
				/>
				<FunctionField<UserRow>
					label="Name"
					render={(record) => record.name ?? record.id}
				/>
				<ReferenceManyField
					label="Hunters"
					reference="hunter"
					target="userId"
				>
					<SingleFieldList>
						<ChipField source="handle" />
					</SingleFieldList>
				</ReferenceManyField>
			</Datagrid>
		</List>
	);
}
