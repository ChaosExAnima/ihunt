import { useCallback, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(() => {
		const saved = localStorage.getItem('theme');
		if (saved) {
			return saved === 'light' ? 'light' : 'dark';
		}

		const prefersDark = window.matchMedia(
			'(prefers-color-scheme: dark)',
		).matches;
		return prefersDark ? 'dark' : 'light';
	});

	useEffect(() => {
		if (theme === 'dark') {
			document.body.classList.add('dark');
		} else {
			document.body.classList.remove('dark');
		}
		try {
			localStorage.setItem('theme', theme);
		} catch {
			console.warn('Could not set theme in local storage');
		}
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
	}, []);

	return { setTheme, theme, toggleTheme };
}
