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
					<Toast key={id} {...props}>
						<div className="grid gap-1">
							{title && (
								<ToastTitle>
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
