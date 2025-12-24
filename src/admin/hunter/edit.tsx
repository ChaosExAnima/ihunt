import { zodResolver } from '@hookform/resolvers/zod';
import {
	AutocompleteInput,
	BooleanInput,
	Edit,
	NumberInput,
	ReferenceInput,
	SelectInput,
	TextInput,
} from 'react-admin';

import { AdminAvatarInput } from '../components/avatar';
import { SimpleForm } from '../components/simple-form';
import { adminHunterSchema } from '../schemas';
import { hunterTypeChoices } from './common';

export function HunterEdit() {
	return (
		<Edit>
			<SimpleForm resolver={zodResolver(adminHunterSchema)}>
				<div className="grid grid-cols-2 gap-4">
					<TextInput source="name" />
					<TextInput source="handle" />
					<TextInput source="pronouns" />
					<SelectInput choices={hunterTypeChoices} source="type" />
					<NumberInput source="money" />
					<NumberInput max={5} min={0} source="rating" step={0.5} />
					<ReferenceInput reference="user" source="userId">
						<AutocompleteInput
							className="col-span-2"
							label="Player"
						/>
					</ReferenceInput>
					<AdminAvatarInput />
					<TextInput className="col-span-2" multiline source="bio" />
					<BooleanInput className="col-span-2" source="alive" />
				</div>
			</SimpleForm>
		</Edit>
	);
}
