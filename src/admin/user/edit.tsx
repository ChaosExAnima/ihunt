import { zodResolver } from '@hookform/resolvers/zod';
import { Prisma } from '@prisma/client';
import {
	AutocompleteInput,
	Edit,
	ReferenceInput,
	TextInput,
	useEditController,
} from 'react-admin';

import { SimpleForm } from '../components/simple-form';
import { HunterRow } from '../hunter/common';
import { adminUserSchema, AdminUserSchema } from '../schemas';
import { UserInput, userSchema } from './common';

export function UserEdit() {
	const { record } = useEditController<AdminUserSchema>();
	return (
		<Edit
			mutationMode="pessimistic"
			title={`Player ${record?.name ?? ''}`}
			transform={editTransform}
		>
			<SimpleForm resolver={zodResolver(adminUserSchema)}>
				<TextInput isRequired source="name" />
				<TextInput isRequired source="email" />
				<ReferenceInput reference="hunter" source="hunter.id">
					<AutocompleteInput
						label="Hunter"
						optionText={(record: HunterRow) =>
							record.userId
								? `${record.name} - Taken by ${record.user.name}`
								: record.name
						}
					/>
				</ReferenceInput>
			</SimpleForm>
		</Edit>
	);
}

function editTransform({
	hunter,
	...record
}: UserInput): Prisma.UserCreateInput {
	if (!hunter.id) {
		return record;
	}
	return {
		...record,
		hunter: {
			connect: hunter.id ? { id: hunter.id } : undefined,
		},
	};
}
