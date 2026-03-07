import { zodResolver } from '@hookform/resolvers/zod';
import {
	AutocompleteArrayInput,
	Create,
	NumberInput,
	ReferenceArrayInput,
	TextInput,
} from 'react-admin';

import { SimpleForm } from '../components/simple-form';
import { AdminHunterSchema, adminUserSchema } from '../schemas';

export function UserCreate() {
	return (
		<Create mutationMode="pessimistic">
			<SimpleForm
				resolver={zodResolver(adminUserSchema.omit({ id: true }))}
			>
				<TextInput isRequired source="name" />
				<NumberInput min={1} defaultValue={1} source="run" />
				<ReferenceArrayInput reference="hunter" source="hunterIds">
					<AutocompleteArrayInput
						label="Hunter"
						optionText={(record: AdminHunterSchema) =>
							record.userId
								? `${record.handle} (taken)`
								: record.handle
						}
					/>
				</ReferenceArrayInput>
			</SimpleForm>
		</Create>
	);
}
