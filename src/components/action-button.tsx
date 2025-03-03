'use client';

import { useState } from 'react';

import { Button, ButtonProps } from './ui/button';

type ActionButtonProps = {
	onChange: () => Promise<void>;
} & Omit<ButtonProps, 'onChange'>;

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
	return <Button {...props} disabled={saving} onClick={handleClick} />;
}
