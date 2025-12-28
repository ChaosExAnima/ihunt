import {
	AutocompleteInput,
	BooleanInput,
	NumberInput,
	ReferenceInput,
	SelectInput,
	TextInput,
} from 'react-admin';

import { HunterTypes } from '@/lib/constants';

import { AdminAvatarInput } from '../components/avatar';

export function HunterCommonDetails() {
	return (
		<div className="md:grid md:grid-cols-2 gap-4">
			<TextInput source="name" />
			<TextInput source="handle" />
			<TextInput source="pronouns" />
			<SelectInput choices={hunterTypeChoices} source="type" />
			<ReferenceInput reference="group" source="groupId" />
			<NumberInput max={5} min={0} source="rating" step={0.5} />
			<NumberInput source="money" />
			<ReferenceInput reference="user" source="userId">
				<AutocompleteInput label="Player" />
			</ReferenceInput>
			<AdminAvatarInput />
			<TextInput minRows={4} multiline source="bio" />
			<BooleanInput className="col-span-2" source="alive" />
		</div>
	);
}

const hunterTypeChoices = Object.entries(HunterTypes).map(([key, val]) => ({
	id: val,
	name: key,
}));
