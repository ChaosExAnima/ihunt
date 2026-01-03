import { Link, useCanGoBack, useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';

import { Button, ButtonProps } from './ui/button';

export function BackButton({
	children,
	goHome = true,
	...props
}: Omit<ButtonProps, 'onClick'> & { goHome?: boolean }) {
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const handleBack = useCallback(() => {
		router.history.back();
	}, [router.history]);

	if (!canGoBack) {
		if (goHome) {
			return (
				<Button variant="secondary" {...props} asChild>
					<Link to="/hunts">{children ?? 'Go home'}</Link>
				</Button>
			);
		}
		return null;
	}

	return (
		<Button variant="secondary" {...props} onClick={handleBack}>
			{children ?? 'Go back'}
		</Button>
	);
}
