'use client';

import { HuntModel, huntSchema } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Create,
	Datagrid,
	DateField,
	DateTimeInput,
	Edit,
	FunctionField,
	List,
	NumberField,
	NumberInput,
	SimpleForm,
	TextField,
	TextInput,
} from 'react-admin';

import HunterList from '../hunter-list';

export function HuntCreate() {
	return (
		<Create>
			<HuntForm create />
		</Create>
	);
}

export function HuntEdit() {
	return (
		<Edit>
			<HuntForm />
		</Edit>
	);
}

export function HuntList() {
	return (
		<List>
			<Datagrid
				bulkActionButtons={false}
				sort={{ field: 'id', order: 'ASC' }}
			>
				<NumberField source="id" />
				<TextField source="name" />
				<TextField source="status" />
				<DateField label="Scheduled for" source="scheduledAt" />
				<NumberField
					locales="de-DE"
					options={{
						currency: 'EUR',
						maximumFractionDigits: 0,
						style: 'currency',
					}}
					source="payment"
				/>
				<NumberField source="danger" />
				<FunctionField
					render={(record: HuntModel) => (
						<HunterList
							hunters={record.hunters}
							max={record.maxHunters}
						/>
					)}
					source="hunters"
				/>
			</Datagrid>
		</List>
	);
}

function HuntForm({}: { create?: boolean }) {
	return (
		<SimpleForm resolver={zodResolver(huntSchema)}>
			<TextInput required source="name" />
			<TextInput required source="description" />
			<DateTimeInput source="scheduledAt" />
			<NumberInput source="payment" />
			<NumberInput defaultValue={4} max={4} min={1} source="maxHunters" />
			<NumberInput defaultValue={1} max={3} min={1} source="danger" />
			<DateTimeInput source="completedAt" />
			<NumberInput max={5} min={0} source="rating" />
			<TextInput source="comment" />
		</SimpleForm>
	);
}
