import { zodResolver } from '@hookform/resolvers/zod';
import { adminHuntSchema, AdminHuntSchema } from '@ihunt/lib/admin-schemas';
import { HUNT_MAX_DANGER, HUNT_MAX_HUNTERS } from '@ihunt/lib/constants';
import {
	AutocompleteArrayInput,
	DateTimeInput,
	Edit,
	NumberInput,
	ReferenceArrayInput,
	SelectInput,
	TextInput,
} from 'react-admin';

import { AdminPhotoList } from '../components/photo-list';
import { AdminPhotoInput } from '../components/photo-upload';
import { SimpleForm } from '../components/simple-form';
import { huntStatusChoices } from './common';

export function HuntEdit() {
	return (
		<Edit<AdminHuntSchema> mutationMode="pessimistic">
			<SimpleForm resolver={zodResolver(adminHuntSchema)}>
				<div className="grid grid-cols-2 gap-4">
					<TextInput required source="name" />
					<TextInput required source="code" />
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
						max={HUNT_MAX_DANGER}
						min={1}
						source="danger"
					/>
					<TextInput source="place" />
					<NumberInput min={0} source="payment" step={10} />
					<DateTimeInput source="scheduledAt" />
					<NumberInput
						defaultValue={HUNT_MAX_HUNTERS}
						min={1}
						source="maxHunters"
					/>
					<ReferenceArrayInput
						label="Hunters"
						reference="hunter"
						source="hunterIds"
					>
						<AutocompleteArrayInput className="col-span-2" />
					</ReferenceArrayInput>
					<div className="col-span-2">
						<ReferenceArrayInput
							label="Photos"
							reference="photo"
							source="photoIds"
						>
							<AdminPhotoList className="mb-4" />
						</ReferenceArrayInput>
						<AdminPhotoInput title="Add new" type="hunt" />
					</div>
					<DateTimeInput source="completedAt" />
					<NumberInput max={5} min={0} source="rating" step={0.5} />
					<TextInput className="col-span-2" multiline source="comment" />
				</div>
			</SimpleForm>
		</Edit>
	);
}
