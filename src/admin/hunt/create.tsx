import { zodResolver } from '@hookform/resolvers/zod';
import {
	Create,
	DateTimeInput,
	NumberInput,
	SelectInput,
	TextInput,
} from 'react-admin';

import { HuntStatus } from '@/lib/constants';

import { SimpleForm } from '../components/simple-form';
import { adminCreateHuntInput } from '../schemas';
import { huntStatusChoices } from './common';

export function HuntCreate() {
	return (
		<Create>
			<SimpleForm resolver={zodResolver(adminCreateHuntInput)}>
				<div className="grid grid-cols-2 gap-4">
					<TextInput required source="name" />
					<SelectInput
						choices={huntStatusChoices([])}
						defaultValue={HuntStatus.Pending}
						required
						source="status"
					/>
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
					<TextInput source="place" />
					<NumberInput
						defaultValue={10_000}
						min={0}
						source="payment"
						step={10}
					/>
					<DateTimeInput defaultValue={null} source="scheduledAt" />
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
