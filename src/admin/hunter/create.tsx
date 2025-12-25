import { zodResolver } from '@hookform/resolvers/zod';
import { Create } from 'react-admin';

import { SimpleForm } from '../components/simple-form';
import { adminHunterSchema } from '../schemas';
import { HunterCommonDetails } from './common';

export function HunterCreate() {
	return (
		<Create>
			<SimpleForm
				resolver={zodResolver(
					adminHunterSchema.omit({ avatarId: true, id: true }),
				)}
			>
				<HunterCommonDetails />
			</SimpleForm>
		</Create>
	);
}
