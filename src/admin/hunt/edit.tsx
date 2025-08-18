import { zodResolver } from '@hookform/resolvers/zod';
import {
	AutocompleteArrayInput,
	DateTimeInput,
	Edit,
	NumberInput,
	ReferenceArrayInput,
	SelectInput,
	SimpleForm,
	TextInput,
} from 'react-admin';

import {
	huntSchemaWithIds,
	huntStatusChoices,
	huntTransformer,
} from './common';

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
					<TextInput source="warnings" />
					<NumberInput
						defaultValue={1}
						max={3}
						min={1}
						source="danger"
					/>
					<TextInput source="place" />
					<NumberInput min={0} source="payment" step={10} />
					<DateTimeInput source="scheduledAt" />
					<NumberInput
						defaultValue={4}
						max={4}
						min={1}
						source="maxHunters"
					/>
					<ReferenceArrayInput reference="hunter" source="hunters">
						<AutocompleteArrayInput className="col-span-2" />
					</ReferenceArrayInput>
					<DateTimeInput source="completedAt" />
					<NumberInput max={5} min={1} source="rating" step={0.5} />
					<TextInput
						className="col-span-2"
						multiline
						source="comment"
					/>
				</div>
			</SimpleForm>
		</Edit>
	);
}
