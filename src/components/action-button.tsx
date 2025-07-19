import { useState } from 'react';

import { Button, ButtonProps } from './ui/button';

type ActionButtonProps = Omit<ButtonProps, 'onChange'> & {
	onChange: () => Promise<void>;
};

export default function ActionButton({
	onChange,
	...props
}: ActionButtonProps) {
	const [saving, setSaving] = useState(false);
	const handleClick = async () => {
		setSaving(true);
		await onChange();
		setSaving(false);
	};
	return (
		<Button
			{...props}
			disabled={saving}
			onClick={() => void handleClick()}
		/>
	);
}
