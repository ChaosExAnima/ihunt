import { LoaderCircleIcon } from 'lucide-react';
import { ReactNode } from 'react';

import { Button, ButtonProps } from './ui/button';

export function ActionButton({
	updating,
	icon,
	children,
	...props
}: ButtonProps & { updating?: boolean; icon?: ReactNode }) {
	return (
		<Button disabled={updating} {...props}>
			{updating ? <LoaderCircleIcon className="animate-spin" /> : icon}
			{children}
		</Button>
	);
}
