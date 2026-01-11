import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner } from 'sonner';

import { useTheme } from '@/hooks/use-theme';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
	const { theme } = useTheme();

	return (
		<Sonner
			className="toaster group"
			icons={{
				error: <OctagonXIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
				success: <CircleCheckIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
			}}
			theme={theme}
			toastOptions={{
				classNames: {
					actionButton:
						'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
					cancelButton:
						'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
					description: 'group-[.toast]:text-muted-foreground',
					toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
				},
			}}
			{...props}
		/>
	);
};
