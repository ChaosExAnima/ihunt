import { zodResolver } from '@hookform/resolvers/zod';
import {
	AutocompleteInput,
	BooleanInput,
	Create,
	NumberInput,
	ReferenceInput,
	SelectInput,
	TextInput,
} from 'react-admin';

import { SimpleForm } from '../components/simple-form';
import { adminHunterSchema } from '../schemas';
import { hunterTypeChoices } from './common';

export function HunterCreate() {
	return (
		<Create>
			<SimpleForm
				resolver={zodResolver(
					adminHunterSchema.omit({ avatarId: true, id: true }),
				)}
			>
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
					<TextInput
						className="col-span-2"
						defaultValue=""
						multiline
						source="bio"
					/>
					<BooleanInput
						className="col-span-2"
						defaultValue={true}
						source="alive"
					/>
				</div>
			</SimpleForm>
		</Create>
	);
}
