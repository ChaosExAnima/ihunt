import { useState } from 'react';

import { Button, ButtonProps } from './ui/button';

type ActionButtonProps = Omit<ButtonProps, 'onChange'> & {
	isActing?: boolean;
	onChange: () => Promise<void> | void;
};

export default function ActionButton({
	isActing,
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
			disabled={saving || isActing === true}
			onClick={() => void handleClick()}
		/>
	);
}
