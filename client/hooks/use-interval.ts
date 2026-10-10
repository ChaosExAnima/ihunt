import { SECOND } from '@ihunt/lib/formats';
import { useEffect } from 'react';

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
