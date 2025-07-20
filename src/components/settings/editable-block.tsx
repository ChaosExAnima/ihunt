import { useState } from 'react';

import { useDebounceCallback } from '@/hooks/use-debounce-callback';

import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface EditableBlockBaseProps {
	multiline?: boolean;
	onChange: (value: string) => void;
	prefix?: string;
	value: string;
}

type EditableBlockProps = EditableBlockBaseProps &
	Omit<
		React.ComponentProps<'input'> & React.ComponentProps<'textarea'>,
		keyof EditableBlockBaseProps
	>;

export function EditableBlock({
	multiline = false,
	onChange,
	prefix,
	value: initialValue,
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
	};
	useDebounceCallback(onChange, value);
	const Component = multiline ? Textarea : Input;

	return <Component {...props} onChange={handleChange} value={value} />;
}
