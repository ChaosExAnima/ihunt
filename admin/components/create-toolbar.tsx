import { FC } from 'react';
import { useNotify, Toolbar, SaveButton } from 'react-admin';
import { useFormContext } from 'react-hook-form';

export const CreateToolbar: FC = () => {
	const notify = useNotify();
	const { reset } = useFormContext();

	return (
		<Toolbar sx={{ gap: 2 }}>
			<SaveButton />
			<SaveButton
				type="button"
				label="Save and Add New"
				variant="text"
				mutationOptions={{
					onSuccess: () => {
						reset();
						window.scrollTo(0, 0);
						notify('ra.notification.created', {
							type: 'info',
							messageArgs: { smart_count: 1 },
						});
					},
				}}
			/>
		</Toolbar>
	);
};
