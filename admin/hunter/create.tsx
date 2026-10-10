import { zodResolver } from '@hookform/resolvers/zod';
import { adminHunterSchema } from '@ihunt/lib/admin-schemas';
import { Create } from 'react-admin';

import { CreateToolbar } from '../components/create-toolbar';
import { SimpleForm } from '../components/simple-form';
import { HunterCommonDetails } from './common';

export function HunterCreate() {
	return (
		<Create>
			<SimpleForm
				resolver={zodResolver(
					adminHunterSchema.omit({ avatarId: true, id: true }),
				)}
				toolbar={<CreateToolbar />}
			>
				<HunterCommonDetails />
			</SimpleForm>
		</Create>
	);
}
