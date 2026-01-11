import { useCallback } from 'react';

import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function Toaster() {
	const { toasts } = useToast();

	const disableHandler = useCallback((event: Event) => {
		event.preventDefault();
	}, []);

	return (
		<ToastProvider>
			{toasts.map(
				({
					action,
					description,
					icon: Icon,
					id,
					permanent,
					title,
					...props
				}) => (
					<Toast
						key={id}
						{...props}
						{...(permanent && {
							onSwipeEnd: disableHandler,
							onSwipeMove: disableHandler,
							onSwipeStart: disableHandler,
						})}
						className="mb-2"
					>
						<div>
							{title && (
								<ToastTitle className="flex gap-2 items-center mb-2">
									{Icon && <Icon />}
									{title}
								</ToastTitle>
							)}
							{description && (
								<ToastDescription>
									{description}
								</ToastDescription>
							)}
						</div>
						{action}
						{!permanent && <ToastClose />}
					</Toast>
				),
			)}
			<ToastViewport />
		</ToastProvider>
	);
}
