import { inferOutput } from '@trpc/tanstack-react-query';
import { createContext, PropsWithChildren, useContext } from 'react';

import { trpc } from '@/lib/api';

export type PlayerSettings = inferOutput<typeof trpc.auth.me>;

const PlayerSettingsContext = createContext<null | PlayerSettings>(null);

export function PlayerSettingsProvider({
	children,
	settings,
}: PropsWithChildren<{ settings: PlayerSettings }>) {
	return (
		<PlayerSettingsContext.Provider value={settings ?? null}>
			{children}
		</PlayerSettingsContext.Provider>
	);
}

export function usePlayerSettings() {
	return useContext(PlayerSettingsContext);
}
