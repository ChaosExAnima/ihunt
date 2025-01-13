import { Datagrid, FunctionField, List, TextField } from 'react-admin';

import PhotoDisplay from '../photo';

export default function HunterList() {
	return (
		<List>
			<Datagrid>
				<TextField source="name" />
				<FunctionField
					render={(record) => {
						console.log(record);

						return <PhotoDisplay photo={record} />;
					}}
					source="hunter.avatar"
				/>
			</Datagrid>
		</List>
	);
}
