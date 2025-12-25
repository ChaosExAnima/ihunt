import { zodResolver } from '@hookform/resolvers/zod';
import { Create, ReferenceArrayInput, TextInput } from 'react-admin';

import { SimpleForm } from '../components/simple-form';
import { adminGroupSchema } from '../schemas';

export function GroupCreate() {
	return (
		<Create>
			<SimpleForm
				resolver={zodResolver(adminGroupSchema.omit({ id: true }))}
			>
				<TextInput source="name" />
				<ReferenceArrayInput
					filter={{ noGroup: true }}
					label="Hunters"
					reference="hunter"
					source="hunterIds"
				/>
			</SimpleForm>
		</Create>
	);
}
