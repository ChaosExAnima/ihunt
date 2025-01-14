import { HunterRow } from '@/app/admin/api/hunter/route';
import { fetchFromApi } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import {
	Create,
	Datagrid,
	Edit,
	FunctionField,
	List,
	NumberField,
	NumberInput,
	SimpleForm,
	TextField,
	TextInput,
} from 'react-admin';

import PhotoDisplay from '../photo';
import ChipListField from './chip-list';

export function HunterCreate() {
	return (
		<Create>
			<SimpleForm>
				<TextInput source="name" />
			</SimpleForm>
		</Create>
	);
}

export function HunterEdit() {
	return (
		<Edit>
			<SimpleForm>
				<TextInput source="name" />
				<NumberInput source="money" />
			</SimpleForm>
		</Edit>
	);
}

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
		<List>
			<Datagrid bulkActionButtons={false}>
				<TextField source="id" />
				<TextField source="name" />
				<FunctionField
					render={(record: HunterRow) =>
						record.avatar && (
							<div className="rounded-full size-10 overflow-hidden">
								<PhotoDisplay photo={record.avatar} />
							</div>
						)
					}
					sortable={false}
					source="avatar"
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
