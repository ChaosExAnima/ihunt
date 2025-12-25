import { zodResolver } from '@hookform/resolvers/zod';
import { Edit } from 'react-admin';

import { SimpleForm } from '../components/simple-form';
import { adminHunterSchema } from '../schemas';
import { HunterCommonDetails } from './common';

export function HunterEdit() {
	return (
		<Edit>
			<SimpleForm resolver={zodResolver(adminHunterSchema)}>
				<HunterCommonDetails />
			</SimpleForm>
		</Edit>
	);
}
