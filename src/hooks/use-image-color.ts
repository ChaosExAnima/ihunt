import { useMemo } from 'react';
import { thumbHashToAverageRGBA } from 'thumbhash';

export function useImageColor(thumbHash?: string | null, threshold = 0.5) {
	return useMemo(() => {
		if (!thumbHash) {
			return false;
		}
		const binary = new Uint8Array(
			atob(thumbHash)
				.split('')
				.map((x) => x.charCodeAt(0)),
		);
		const average = thumbHashToAverageRGBA(binary);
		return (
			average.r >= threshold &&
			average.g >= threshold &&
			average.b >= threshold
		);
	}, [thumbHash, threshold]);
}
