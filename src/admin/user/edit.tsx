import { zodResolver } from '@hookform/resolvers/zod';
import {
	AutocompleteInput,
	Edit,
	NumberInput,
	ReferenceInput,
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
		<Edit
			mutationMode="pessimistic"
			title={`Player ${player?.code.toUpperCase() ?? ''}`}
		>
			<SimpleForm resolver={zodResolver(adminUserSchema)}>
				<TextInput
					isRequired
					source="code"
					className="[&_input]:uppercase"
				/>
				<NumberInput min={1} source="run" />
				<ReferenceInput reference="hunter" source="hunterId">
					<AutocompleteInput
						label="Hunters"
						optionText={(record: AdminHunterSchema) =>
							record.userId && record.userId !== player?.id
								? `${record.handle} (taken)`
								: record.handle
						}
					/>
				</ReferenceInput>
			</SimpleForm>
		</Edit>
	);
}
