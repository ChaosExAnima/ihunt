'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, EditIcon, Play } from 'lucide-react';
import { ChangeEvent, FormEventHandler, useState } from 'react';
import {
	AutocompleteArrayInput,
	Create,
	Datagrid,
	DateField,
	DateTimeInput,
	Edit,
	FormDataConsumer,
	FunctionField,
	IconButtonWithTooltip,
	Link,
	List,
	NumberField,
	NumberInput,
	ReferenceArrayInput,
	SelectArrayInput,
	SelectInput,
	SimpleForm,
	TextField,
	TextInput,
	useRecordContext,
	useUpdate,
} from 'react-admin';
import { z } from 'zod';

import HunterList from '@/components/hunter-list';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	currencyFormatter,
	HuntSchema,
	huntSchema,
	HuntStatus,
	HuntStatusValues,
	Locale,
} from '@/lib/constants';

type HuntStatusName = keyof typeof HuntStatus;
const statusNames = Object.keys(HuntStatus) as HuntStatusName[];

const huntSchemaWithIds = huntSchema.extend({
	hunters: z.array(z.number()),
});
export function HuntCreate() {
	return (
		<Create>
			<SimpleForm resolver={zodResolver(huntSchemaWithIds)}>
				<div className="grid grid-cols-2 gap-4">
					<TextInput required source="name" />
					<TextInput
						className="col-span-2"
						multiline
						required
						source="description"
					/>
					<TextInput source="warnings" />
					<NumberInput
						defaultValue={1}
						max={3}
						min={1}
						source="danger"
					/>
					<NumberInput min={0} source="payment" step={10} />
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
		<Edit mutationMode="pessimistic" transform={huntTransformer}>
			<SimpleForm resolver={zodResolver(huntSchemaWithIds)}>
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
									<TextInput
										{...rest}
										disabled={completed}
										source="warnings"
									/>
									<NumberInput
										{...rest}
										defaultValue={1}
										disabled={completed}
										max={3}
										min={1}
										source="danger"
									/>
									<TextInput
										disabled={completed}
										source="place"
									/>
									<NumberInput
										{...rest}
										disabled={completed}
										min={0}
										source="payment"
										step={10}
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
									<ReferenceArrayInput
										reference="hunter"
										source="hunters"
									>
										<AutocompleteArrayInput className="col-span-2" />
									</ReferenceArrayInput>
									<DateTimeInput
										{...rest}
										source="completedAt"
									/>
									<NumberInput
										{...rest}
										max={5}
										min={1}
										source="rating"
										step={0.5}
									/>
									<TextInput
										{...rest}
										className="col-span-2"
										multiline
										source="comment"
									/>
								</>
							);
						}}
					</FormDataConsumer>
				</div>
			</SimpleForm>
		</Edit>
	);
}

function huntStatusChoices(disabled: HuntStatusValues[] = []) {
	return statusNames.map((status) => ({
		disabled: disabled.includes(HuntStatus[status]),
		id: HuntStatus[status],
		name: status,
	}));
}

function huntTransformer(data: Partial<HuntSchema>) {
	delete data.hunters;
	delete data.photos;
	return data;
}

function renderHuntStatus(record: HuntSchema) {
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
				rowClick={false}
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
					render={(record: HuntSchema) => (
						<HunterList
							hunters={record.hunters ?? []}
							max={record.maxHunters}
						/>
					)}
					source="hunters"
				/>
				<HuntActions />
			</Datagrid>
		</List>
	);
}

function HuntActions() {
	const hunt = useRecordContext<HuntSchema>();
	const [update, { isPending }] = useUpdate<HuntSchema>();

	if (!hunt) {
		return null;
	}

	const handleStart = () => {
		update('hunt', {
			data: { status: HuntStatus.Active },
			id: hunt.id,
			previousData: hunt,
		});
	};
	return (
		<div>
			<Link to={`/hunt/${hunt.id}`}>
				<IconButtonWithTooltip label="Edit">
					<EditIcon />
				</IconButtonWithTooltip>
			</Link>
			{hunt.status === HuntStatus.Available && (
				<IconButtonWithTooltip
					disabled={isPending}
					label="Start"
					onClick={handleStart}
				>
					<Play />
				</IconButtonWithTooltip>
			)}
			{hunt.status === HuntStatus.Active && <HuntCompleteDialog />}
		</div>
	);
}

function HuntCompleteDialog() {
	const hunt = useRecordContext<HuntSchema>();
	const [modalOpen, setModalOpen] = useState(false);
	const [modalData, setModalData] = useState({
		comment: '',
		payment: hunt?.payment ?? 0,
		rating: 1,
	});
	const [update, { isLoading }] = useUpdate<HuntSchema>();

	const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();
		update('hunt', {
			data: {
				...modalData,
				completedAt: new Date(),
				status: HuntStatus.Complete,
			},
			id: hunt?.id,
		});
	};
	const createFieldHandler =
		(field: keyof typeof modalData) =>
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			setModalData((prevData) => ({
				...prevData,
				[field]:
					field === 'comment'
						? event.target.value
						: parseFloat(event.target.value),
			}));

	return (
		<Dialog onOpenChange={setModalOpen} open={modalOpen}>
			<DialogTrigger asChild>
				<IconButtonWithTooltip label="Complete">
					<Check />
				</IconButtonWithTooltip>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Complete hunt</DialogTitle>
				</DialogHeader>
				<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
					<p>
						You are paying the hunters&nbsp;
						{currencyFormatter.format(modalData.payment)}.
					</p>
					<Input
						min={0}
						onChange={createFieldHandler('payment')}
						step={10}
						type="number"
						value={modalData.payment}
					/>
					<p>Rate your hunters: {modalData.rating}</p>
					<Input
						max={5}
						min={1}
						onChange={createFieldHandler('rating')}
						step={0.5}
						type="range"
						value={modalData.rating}
					/>
					<p>Leave a comment:</p>
					<Textarea
						onChange={createFieldHandler('comment')}
						placeholder="Complain or praise your hunters"
						value={modalData.comment}
					/>
					<Button
						disabled={isLoading}
						type="submit"
						variant="success"
					>
						Complete
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
