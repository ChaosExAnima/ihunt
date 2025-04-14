import { Create, SimpleForm, TextInput, NumberInput } from 'react-admin';

export function HunterCreate() {
	return (
		<Create>
			<SimpleForm>
				<TextInput source="name" />
				<NumberInput defaultValue={0} source="money" />
			</SimpleForm>
		</Create>
	);
}
