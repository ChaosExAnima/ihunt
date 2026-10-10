import { onlineManager } from '@tanstack/react-query';
import { Wifi, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { SECOND } from '@/lib/formats';

import { toast } from './use-toast';

export function useOffline() {
	const [offlineToast, setToast] = useState<null | ReturnType<typeof toast>>(
		null,
	);

	const handleOffline = useCallback(
		(isOnline: boolean) => {
			if (!offlineToast && !isOnline) {
				setToast(
					toast({
						description: 'You are offline',
						duration: Infinity,
						icon: WifiOff,
						permanent: true,
						title: 'Offline',
						variant: 'destructive',
					}),
				);
			} else if (offlineToast && isOnline) {
				offlineToast.dismiss();
				setToast(null);
				toast({
					description: 'You are back online!',
					duration: 3 * SECOND,
					icon: Wifi,
					title: 'Back online',
				});
			}
		},
		[offlineToast],
	);

	useEffect(() => {
		return onlineManager.subscribe(handleOffline);
	}, [handleOffline]);
}
