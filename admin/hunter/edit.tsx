import { zodResolver } from '@hookform/resolvers/zod';
import { adminHunterSchema } from '@ihunt/lib/admin-schemas';
import { Edit } from 'react-admin';

import { SimpleForm } from '../components/simple-form';
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
