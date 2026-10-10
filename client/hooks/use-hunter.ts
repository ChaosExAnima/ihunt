import { usePlayer } from '@/components/providers/player';

export function useHunter() {
	return usePlayer()?.hunter ?? null;
}

export function useHunterId() {
	const hunter = useHunter();
	return hunter?.id ?? null;
}
