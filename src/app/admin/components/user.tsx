import { zodResolver } from '@hookform/resolvers/zod';
import { Prisma } from '@prisma/client';
import {
	AutocompleteInput,
	Datagrid,
	Edit,
	FunctionField,
	ImageField,
	List,
	ReferenceField,
	ReferenceInput,
	SimpleForm,
	TextField,
	TextInput,
} from 'react-admin';
import { z } from 'zod';

import { idSchema } from '@/lib/api';

import { HunterRow } from './hunter';

type UserRow = Prisma.UserGetPayload<{
	include: { hunter: { include: { avatar: true } } };
}>;

const userSchema = z.object({
	email: z.string().email(),
	hunter: z.object({ id: idSchema.nullable() }),
	name: z.string(),
});

type UserInput = z.infer<typeof userSchema>;

export function UserEdit() {
	return (
		<Edit mutationMode="pessimistic" transform={editTransform}>
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
export function UserList() {
	return (
		<List>
			<Datagrid>
				<ImageField
					label="Avatar"
					source="image"
					sx={{
						'& .RaImageField-image': {
							borderRadius: '50%',
							height: 50,
							overflow: 'hidden',
							width: 50,
						},
					}}
				/>
				<FunctionField<UserRow>
					label="Name"
					render={(record) => record.name ?? record.id}
				/>
				<TextField emptyText="Not set" source="email" />
				<ReferenceField reference="hunter" source="hunter.id" />
			</Datagrid>
		</List>
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
