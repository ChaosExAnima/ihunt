'use client';

import HunterList from '@/components/hunter-list';
import {
	HuntModel,
	HuntSchema,
	huntSchema,
	HuntStatus,
	HuntStatusValues,
	Locale,
} from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { Hunter } from '@prisma/client';
import {
	AutocompleteArrayInput,
	AutocompleteArrayInputProps,
	Create,
	Datagrid,
	DateField,
	DateTimeInput,
	Edit,
	FormDataConsumer,
	FunctionField,
	List,
	NumberField,
	NumberInput,
	SelectArrayInput,
	SelectInput,
	SimpleForm,
	TextField,
	TextInput,
	useGetList,
	useInput,
} from 'react-admin';

type HuntStatusName = keyof typeof HuntStatus;
const statusNames = Object.keys(HuntStatus) as HuntStatusName[];

export function HuntCreate() {
	return (
		<Create transform={huntTransform}>
			<SimpleForm resolver={zodResolver(huntSchema)}>
				<div className="grid grid-cols-2 gap-4">
					<TextInput required source="name" />
					<TextInput
						className="col-span-2"
						multiline
						required
						source="description"
					/>
					<NumberInput min={0} source="payment" step={10} />
					<NumberInput
						defaultValue={1}
						max={3}
						min={1}
						source="danger"
					/>
					<DateTimeInput source="scheduledAt" />
					<NumberInput
						defaultValue={4}
						max={4}
						min={1}
						source="maxHunters"
					/>
				</div>
			</SimpleForm>
		</Create>
	);
}

export function HuntEdit() {
	return (
		<Edit transform={huntTransform}>
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
					<FormDataConsumer<HuntSchema>>
						{({ formData: { status }, ...rest }) => {
							const completed = status === HuntStatus.Complete;
							return (
								<>
									<NumberInput
										{...rest}
										disabled={completed}
										min={0}
										source="payment"
										step={10}
									/>
									<NumberInput
										{...rest}
										defaultValue={1}
										disabled={completed}
										max={3}
										min={1}
										source="danger"
									/>
									<DateTimeInput
										{...rest}
										disabled={completed}
										source="scheduledAt"
									/>
									<NumberInput
										{...rest}
										defaultValue={4}
										disabled={completed}
										max={4}
										min={1}
										source="maxHunters"
									/>
									<EditHunters
										{...rest}
										className="col-span-2"
										disabled={completed}
									/>
									{completed && (
										<>
											<DateTimeInput
												{...rest}
												source="completedAt"
											/>
											<NumberInput
												{...rest}
												defaultValue={5}
												max={5}
												min={1}
												source="rating"
											/>
											<TextInput
												{...rest}
												className="col-span-2"
												multiline
												source="comment"
											/>
										</>
									)}
								</>
							);
						}}
					</FormDataConsumer>
				</div>
			</SimpleForm>
		</Edit>
	);
}

function EditHunters(props: AutocompleteArrayInputProps) {
	const { field } = useInput({ source: 'hunters' });
	const { data = [] } = useGetList<Hunter>('hunter');

	return (
		<AutocompleteArrayInput
			{...props}
			{...field}
			choices={data}
			format={(hunters: Hunter[]) => hunters.map(({ id }) => id)}
			onChange={(_v, records) => field.onChange(records)}
			parse={(v: number[]) => data.filter(({ id }) => v.includes(id))}
			source="hunters"
		/>
	);
}

function huntStatusChoices(disabled: HuntStatusValues[] = []) {
	return statusNames.map((status) => ({
		disabled: disabled.includes(HuntStatus[status]),
		id: HuntStatus[status],
		name: status,
	}));
}

function huntTransform(
	record: {
		hunterIds: number[];
		hunters?: { id: number }[];
	} & Omit<HuntModel, 'hunters'>,
) {
	record.hunterIds = (record?.hunters ?? []).map(({ id }) => id);
	delete record.hunters;
	return record;
}

function renderHuntStatus(record: HuntModel) {
	return statusNames.find((name) => HuntStatus[name] === record.status);
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
				<FunctionField render={renderHuntStatus} source="status" />
				<DateField
					emptyText="Not scheduled"
					label="Scheduled for"
					source="scheduledAt"
				/>
				<NumberField
					locales={Locale}
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
