import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';

import { Button, ButtonProps } from './ui/button';

export function BackButton(props: Omit<ButtonProps, 'onClick'>) {
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const handleBack = useCallback(() => {
		router.history.back();
	}, [router.history]);

	if (!canGoBack) {
		return null;
	}

	return (
		<Button variant="secondary" {...props} onClick={handleBack}>
			{props.children ?? 'Go back'}
		</Button>
	);
}
