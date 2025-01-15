import { fetchFromApi } from '@/lib/api';
import { Prisma } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import {
	Create,
	Datagrid,
	DeleteButton,
	Edit,
	FunctionField,
	List,
	NumberField,
	NumberInput,
	SearchInput,
	SimpleForm,
	TextField,
	TextInput,
	useEditController,
} from 'react-admin';

import Avatar from '../avatar';
import PhotoDisplay from '../photo';
import ChipListField from './chip-list';

type HunterRow = Prisma.HunterGetPayload<{
	include: { avatar: true; hunts: true };
}>;

export function HunterCreate() {
	return (
		<Create>
			<SimpleForm>
				<TextInput source="name" />
				<NumberInput defaultValue={0} source="money" />
			</SimpleForm>
		</Create>
	);
}

export function HunterEdit() {
	const { record } =
		useEditController<
			Prisma.HunterGetPayload<{ include: { avatar: true } }>
		>();
	return (
		<Edit>
			<SimpleForm>
				<TextInput source="name" />
				<NumberInput source="money" />
				{record?.avatar && (
					<figure>
						<PhotoDisplay className="w-40" photo={record.avatar} />
						<figcaption>
							Avatar{' '}
							<DeleteButton
								mutationMode="pessimistic"
								record={{ id: record.avatar.id }}
								redirect={false}
								resource="photo"
								successMessage="Avatar deleted"
							/>
						</figcaption>
					</figure>
				)}
				{/* TODO: Handle photos */}
			</SimpleForm>
		</Edit>
	);
}

const listFilters = [<SearchInput alwaysOn key="1" source="name" />];

export function HunterList() {
	const { isPending, mutate } = useMutation({
		mutationFn: ({
			hunterId,
			huntId,
		}: {
			hunterId: number;
			huntId: number;
		}) =>
			fetchFromApi('/admin/api/hunt/hunters', {
				body: {
					hunterId,
					huntId,
				},
				method: 'DELETE',
			}),
	});
	const handleDelete = async (hunterId: number, huntId: number) => {
		await mutate({ hunterId, huntId });
	};
	return (
		<List filters={listFilters}>
			<Datagrid
				bulkActionButtons={false}
				sort={{ field: 'id', order: 'ASC' }}
			>
				<TextField source="id" />
				<TextField source="name" />
				<FunctionField
					render={(record: HunterRow) => <Avatar hunter={record} />}
					sortable={false}
					source="avatar"
				/>
				<FunctionField
					label="Rating"
					render={ratingField}
					sortable={false}
				/>
				<NumberField
					locales="de-DE"
					options={{
						currency: 'EUR',
						maximumFractionDigits: 0,
						style: 'currency',
					}}
					source="money"
					textAlign="left"
				/>
				<ChipListField
					empty="No hunts yet"
					fieldSource="name"
					isLoading={isPending}
					label="Hunts"
					onDelete={handleDelete}
					sortable={false}
					source="hunts"
				/>
			</Datagrid>
		</List>
	);
}

const numberFormatter = new Intl.NumberFormat('de-DE', {
	minimumFractionDigits: 1,
});

function ratingField(record: HunterRow) {
	return numberFormatter.format(
		record.hunts.reduce(
			(rating, hunt) => (hunt.rating ? rating + hunt.rating : rating),
			0,
		),
	);
}
