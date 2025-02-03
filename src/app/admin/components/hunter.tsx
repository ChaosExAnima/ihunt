'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Prisma } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import {
	AutocompleteInput,
	Create,
	Datagrid,
	DeleteButton,
	Edit,
	FunctionField,
	List,
	NumberField,
	NumberInput,
	ReferenceInput,
	SearchInput,
	SimpleForm,
	TextField,
	TextInput,
	useEditController,
	useRefresh,
} from 'react-admin';
import { z } from 'zod';

import Avatar from '@/components/avatar';
import PhotoDisplay from '@/components/photo';
import UploadPhoto from '@/components/upload-photo';
import { fetchFromApi } from '@/lib/api';
import { Locale } from '@/lib/constants';

import ChipListField from './chip-list';

export type HunterRow = Prisma.HunterGetPayload<{
	include: { avatar: true; hunts: true; user: true };
}>;

const hunterSchema = z.object({
	money: z.number().int().min(0).default(0),
	name: z.string().min(1),
	user: z.object({ id: z.number().int() }),
});

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
	const { record } = useEditController<HunterRow>();
	const refresh = useRefresh();
	const { mutateAsync } = useMutation({
		async mutationFn(blob: Blob) {
			if (!record?.id) {
				throw new Error('No record ID');
			}
			const { success } = await fetchFromApi<{ success: boolean }>(
				`/admin/api/photo/upload?avatar=true&hunterId=${record.id}`,
				{
					body: blob,
					method: 'POST',
				},
			);
			if (!success) {
				throw new Error('Not able to upload image');
			}
			return true;
		},
		onSuccess() {
			refresh();
		},
	});

	return (
		<Edit>
			<SimpleForm resolver={zodResolver(hunterSchema)}>
				<TextInput source="name" />
				<NumberInput source="money" />
				{record?.avatar && (
					<figure>
						<PhotoDisplay className="w-40" photo={record.avatar} />
						<figcaption>
							Avatar{' '}
							<DeleteButton
								mutationMode="pessimistic"
								mutationOptions={{ onSuccess: () => refresh() }}
								record={{ id: record.avatar.id }}
								redirect={false}
								resource="photo"
								successMessage="Avatar deleted"
							/>
						</figcaption>
					</figure>
				)}
				<UploadPhoto circular onCrop={mutateAsync} title="Avatar" />
				<ReferenceInput reference="user" source="user.id">
					<AutocompleteInput label="User" />
				</ReferenceInput>
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
					locales={Locale}
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

const numberFormatter = new Intl.NumberFormat(Locale, {
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
