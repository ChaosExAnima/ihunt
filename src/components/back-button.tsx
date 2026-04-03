import {
	Link,
	LinkProps,
	useCanGoBack,
	useRouter,
} from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { useCallback } from 'react';

import { Button, ButtonProps } from './ui/button';

export function BackButton({
	children,
	to = '/',
	...props
}: Omit<ButtonProps, 'onClick'> & { goHome?: boolean; to?: LinkProps['to'] }) {
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const handleBack = useCallback(() => {
		router.history.back();
	}, [router.history]);

	if (!canGoBack) {
		return (
			<Button variant="secondary" {...props} asChild>
				<Link to={to}>
					{children ?? (
						<>
							<ArrowLeftIcon />
							Go back
						</>
					)}
				</Link>
			</Button>
		);
	}

	return (
		<Button variant="secondary" {...props} onClick={handleBack}>
			{children ?? (
				<>
					<ArrowLeftIcon />
					Go back
				</>
			)}
		</Button>
	);
}
