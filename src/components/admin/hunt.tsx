'use client';

import {
	HuntModel,
	huntSchema,
	HuntStatus,
	HuntStatusValues,
} from '@/lib/constants';
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
	SelectArrayInput,
	SelectInput,
	SimpleForm,
	TextField,
	TextInput,
} from 'react-admin';

import HunterList from '../hunter-list';

type HuntStatusNames = Array<keyof typeof HuntStatus>;

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

function huntStatusChoices(disabled: HuntStatusValues[] = []) {
	const statusNames = Object.keys(HuntStatus) as HuntStatusNames;
	return statusNames.map((status) => ({
		disabled: disabled.includes(HuntStatus[status]),
		id: HuntStatus[status],
		name: status,
	}));
}

const listFilters = [
	<SelectArrayInput
		alwaysOn
		choices={huntStatusChoices()}
		key="1"
		source="status"
	/>,
];

export function HuntList() {
	return (
		<List filters={listFilters}>
			<Datagrid
				bulkActionButtons={false}
				sort={{ field: 'id', order: 'ASC' }}
			>
				<NumberField source="id" />
				<TextField source="name" />
				<TextField source="status" />
				<DateField
					emptyText="Not scheduled"
					label="Scheduled for"
					source="scheduledAt"
				/>
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
			<div className="grid grid-cols-2 gap-4">
				<TextInput required source="name" />
				<SelectInput
					choices={huntStatusChoices([])}
					required
					source="status"
				/>
				<TextInput
					className="col-span-2"
					multiline
					required
					source="description"
				/>
				<NumberInput source="payment" />
				<NumberInput defaultValue={1} max={3} min={1} source="danger" />
				<DateTimeInput source="scheduledAt" />
				<NumberInput
					defaultValue={4}
					max={4}
					min={1}
					source="maxHunters"
				/>
				<DateTimeInput source="completedAt" />
				<NumberInput max={5} min={0} source="rating" />
				<TextInput className="col-span-2" multiline source="comment" />
			</div>
		</SimpleForm>
	);
}
