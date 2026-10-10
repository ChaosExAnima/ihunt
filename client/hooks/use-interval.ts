import { useEffect } from 'react';

import { SECOND } from '@/lib/formats';

export function useInterval({
	cb,
	interval = SECOND,
}: {
	cb: () => void;
	interval?: number;
}) {
	useEffect(() => {
		const id = setInterval(cb, interval);
		return () => {
			clearInterval(id);
		};
	}, [cb, interval]);
}
