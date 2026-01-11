import { usePlayer } from '@/components/providers/player';

export function useSettings() {
	return usePlayer()?.settings ?? null;
}
