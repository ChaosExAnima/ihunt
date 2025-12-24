import { zodResolver } from '@hookform/resolvers/zod';
import {
	AutocompleteInput,
	BooleanInput,
	Edit,
	ImageField,
	ImageInput,
	NumberInput,
	ReferenceInput,
	SelectInput,
	TextInput,
} from 'react-admin';

import { HunterTypes } from '@/lib/constants';

import { SimpleForm } from '../components/simple-form';
import { hunterSchema } from './common';

const hunterTypeChoices = Object.entries(HunterTypes).map(([key, val]) => ({
	id: val,
	name: key,
}));

export function HunterEdit() {
	return (
		<Edit>
			<SimpleForm resolver={zodResolver(hunterSchema)}>
				<TextInput source="name" />
				<TextInput source="handle" />
				<TextInput source="pronouns" />
				<SelectInput choices={hunterTypeChoices} source="type" />
				<BooleanInput source="alive" />
				<NumberInput source="money" />
				<ImageInput source="avatar">
					<ImageField className="w-full" source="url" title="path" />
				</ImageInput>
				<ReferenceInput reference="user" source="userId">
					<AutocompleteInput label="Player" />
				</ReferenceInput>
			</SimpleForm>
		</Edit>
	);
}
