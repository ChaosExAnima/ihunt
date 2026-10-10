import { zodResolver } from '@hookform/resolvers/zod';
import { AdminHunterSchema, adminUserSchema } from '@ihunt/lib/admin-schemas';
import {
	AutocompleteArrayInput,
	Create,
	NumberInput,
	ReferenceArrayInput,
	TextInput,
} from 'react-admin';

import { CreateToolbar } from '../components/create-toolbar';
import { SimpleForm } from '../components/simple-form';

export function UserCreate() {
	return (
		<Create mutationMode="pessimistic">
			<SimpleForm
				resolver={zodResolver(adminUserSchema.omit({ id: true }))}
				toolbar={<CreateToolbar />}
			>
				<TextInput isRequired source="code" className="[&_input]:uppercase" />
				<NumberInput min={1} defaultValue={1} source="run" />
				<ReferenceArrayInput reference="hunter" source="hunterIds">
					<AutocompleteArrayInput
						label="Hunter"
						optionText={(record: AdminHunterSchema) =>
							record.userId ? `${record.handle} (taken)` : record.handle
						}
					/>
				</ReferenceArrayInput>
			</SimpleForm>
		</Create>
	);
}
