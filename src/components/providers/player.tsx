import { inferOutput } from '@trpc/tanstack-react-query';
import { createContext, PropsWithChildren, useContext, useState } from 'react';

import { trpc } from '@/lib/api';

export type PlayerSettings = inferOutput<typeof trpc.auth.me>;

const PlayerSettingsContext = createContext<null | PlayerSettings>(null);

export function PlayerSettingsProvider({ children }: PropsWithChildren) {
	const [settings, setSettings] = useState<null | PlayerSettings>(null);
	return (
		<PlayerSettingsContext.Provider value={settings}>
			{children}
		</PlayerSettingsContext.Provider>
	);
}

export function usePlayerSettings() {
	return useContext(PlayerSettingsContext);
}
