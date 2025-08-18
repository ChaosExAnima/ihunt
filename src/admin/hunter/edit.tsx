import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
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
import { trpc } from '@/lib/api';

import { HunterRow, hunterSchema } from './common';

export function HunterEdit() {
	const { record } = useEditController<HunterRow>();
	const refresh = useRefresh();
	const { mutateAsync } = useMutation(
		trpc.hunter.updateAvatar.mutationOptions({
			onSuccess: () => refresh(),
		}),
	);
	const handleCrop = useCallback(async (blob: Blob) => {
		const formData = new FormData();
		formData.append('photo', blob);
		const result = await mutateAsync(formData);
		return result.success;
	}, []);

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
				<UploadPhoto circular onCrop={handleCrop} title="Avatar" />
				<ReferenceInput reference="user" source="user.id">
					<AutocompleteInput label="Player" />
				</ReferenceInput>
			</SimpleForm>
		</Edit>
	);
}
