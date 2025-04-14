import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
	AutocompleteInput,
	DeleteButton,
	Edit,
	NumberInput,
	ReferenceInput,
	SimpleForm,
	TextInput,
	useEditController,
	useRefresh,
} from 'react-admin';

import PhotoDisplay from '@/components/photo';
import UploadPhoto from '@/components/upload-photo';
import { fetchFromApi } from '@/lib/api';

import { HunterRow, hunterSchema } from './common';

export function HunterEdit() {
	const { record } = useEditController<HunterRow>();
	const refresh = useRefresh();
	const { mutateAsync } = useMutation({
		async mutationFn(blob: Blob) {
			if (!record?.id) {
				throw new Error('No record ID');
			}
			const { success } = await fetchFromApi<{ success: boolean }>(
				`/admin/api/photo/upload?avatar=true&hunterId=${record.id}`,
				{
					body: blob,
					method: 'POST',
				},
			);
			if (!success) {
				throw new Error('Not able to upload image');
			}
			return true;
		},
		onSuccess() {
			refresh();
		},
	});

	return (
		<Edit>
			<SimpleForm resolver={zodResolver(hunterSchema)}>
				<TextInput source="name" />
				<NumberInput source="money" />
				{record?.avatar && (
					<figure>
						<PhotoDisplay className="w-40" photo={record.avatar} />
						<figcaption>
							Avatar{' '}
							<DeleteButton
								mutationMode="pessimistic"
								mutationOptions={{ onSuccess: () => refresh() }}
								record={{ id: record.avatar.id }}
								redirect={false}
								resource="photo"
								successMessage="Avatar deleted"
							/>
						</figcaption>
					</figure>
				)}
				<UploadPhoto circular onCrop={mutateAsync} title="Avatar" />
				<ReferenceInput reference="user" source="user.id">
					<AutocompleteInput label="Player" />
				</ReferenceInput>
			</SimpleForm>
		</Edit>
	);
}
