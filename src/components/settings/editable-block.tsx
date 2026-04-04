import { useState } from 'react';

import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface EditableBlockBaseProps {
	multiline?: boolean;
	onChange?: (value: string) => void;
	prefix?: string;
	initialValue: string;
	isUpdating?: boolean;
}

type EditableBlockProps = EditableBlockBaseProps &
	Omit<
		React.ComponentProps<'input'> & React.ComponentProps<'textarea'>,
		keyof EditableBlockBaseProps
	>;

export function EditableBlock({
	initialValue,
	onChange,
	isUpdating,
	prefix,
	multiline = false,
	...props
}: EditableBlockProps) {
	const [value, setValue] = useState(initialValue);
	const handleChange: React.ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement
	> = (event) => {
		let newValue = event.target.value;
		if (newValue && prefix && !newValue.startsWith(prefix)) {
			newValue = prefix + newValue;
		}
		setValue(newValue);
		onChange?.(newValue);
	};
	const Component = multiline ? Textarea : Input;

	return (
		<>
			<Component
				{...props}
				value={value}
				onChange={handleChange}
				readOnly={isUpdating || props.readOnly}
			/>
		</>
	);
}
