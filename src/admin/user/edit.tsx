import { zodResolver } from '@hookform/resolvers/zod';
import { Prisma } from '@prisma/client';
import {
	AutocompleteInput,
	Edit,
	ReferenceInput,
	SimpleForm,
	TextInput,
	useEditController,
} from 'react-admin';

import { HunterRow } from '../hunter/common';
import { UserInput, UserRow, userSchema } from './common';

export function UserEdit() {
	const { record } = useEditController<UserRow>();
	return (
		<Edit
			mutationMode="pessimistic"
			title={`Player ${record?.name ?? record?.email ?? ''}`}
			transform={editTransform}
		>
			<SimpleForm resolver={zodResolver(userSchema)}>
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
