'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Create,
	DateTimeInput,
	NumberInput,
	SimpleForm,
	TextInput,
} from 'react-admin';

import { huntSchemaWithIds } from './common';

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
