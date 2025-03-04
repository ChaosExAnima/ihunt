'use client';

import { createContext, PropsWithChildren, useContext } from 'react';

import { HunterSchema } from '@/lib/schemas';

export interface PlayerSettings {
	hideMoney: boolean;
	hunter?: HunterSchema;
	loggedIn: boolean;
}

const defaultSettings: PlayerSettings = {
	hideMoney: false,
	loggedIn: false,
};

const PlayerSettingsContext = createContext(defaultSettings);

export function usePlayerSettings() {
	return useContext(PlayerSettingsContext);
}

export function PlayerSettingsProvider({
	children,
	settings,
}: PropsWithChildren<{ settings: PlayerSettings }>) {
	return (
		<PlayerSettingsContext.Provider value={settings}>
			{children}
		</PlayerSettingsContext.Provider>
	);
}
