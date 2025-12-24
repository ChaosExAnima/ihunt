import { zodResolver } from '@hookform/resolvers/zod';
import {
	AutocompleteArrayInput,
	Edit,
	NumberInput,
	ReferenceArrayInput,
	TextInput,
	useEditController,
} from 'react-admin';

import { SimpleForm } from '../components/simple-form';
import {
	AdminHunterSchema,
	adminUserSchema,
	AdminUserSchema,
} from '../schemas';

export function UserEdit() {
	const { record: player } = useEditController<AdminUserSchema>();
	return (
		<Edit mutationMode="pessimistic" title={`Player ${player?.name ?? ''}`}>
			<SimpleForm resolver={zodResolver(adminUserSchema)}>
				<TextInput isRequired source="name" />
				<NumberInput min={1} source="run" />
				<ReferenceArrayInput reference="hunter" source="hunterIds">
					<AutocompleteArrayInput
						label="Hunters"
						optionText={(record: AdminHunterSchema) =>
							record.userId && record.userId !== player?.id
								? `${record.handle} (taken)`
								: record.handle
						}
					/>
				</ReferenceArrayInput>
			</SimpleForm>
		</Edit>
	);
}
