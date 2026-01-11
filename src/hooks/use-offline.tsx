import { onlineManager } from '@tanstack/react-query';
import { Wifi, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useOffline() {
	const [offlineToast, setToast] = useState<null | ReturnType<typeof toast>>(
		null,
	);

	const handleOffline = useCallback(
		(isOnline: boolean) => {
			if (!offlineToast && !isOnline) {
				setToast(
					toast.error('Offline', {
						description: 'You are offline',
						duration: Infinity,
						icon: <WifiOff className="size-4" />,
					}),
				);
			} else if (offlineToast && isOnline) {
				toast.dismiss(offlineToast);
				setToast(null);
				toast('Back online', {
					description: 'You are back online!',
					icon: <Wifi className="size-4" />,
				});
			}
		},
		[offlineToast],
	);

	useEffect(() => {
		return onlineManager.subscribe(handleOffline);
	}, [handleOffline]);
}
