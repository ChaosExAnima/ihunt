import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, ReferenceArrayInput, TextInput } from 'react-admin';

import { SimpleForm } from '../components/simple-form';
import { adminGroupSchema } from '../schemas';

export function GroupEdit() {
	return (
		<Edit>
			<SimpleForm
				resolver={zodResolver(adminGroupSchema.omit({ id: true }))}
			>
				<TextInput source="name" />
				<ReferenceArrayInput
					filter={{ noGroups: true }}
					label="Hunters"
					reference="hunter"
					source="hunterIds"
				/>
			</SimpleForm>
		</Edit>
	);
}
