import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

async function start() {
	const app = await import('@/app');
	const App = app.App;

	// Render the app
	const rootElement = document.getElementById('root')!;
	if (!rootElement.innerHTML) {
		const root = createRoot(rootElement);
		root.render(
			<StrictMode>
				<App />
			</StrictMode>,
		);
	}
}

start().catch((err) => {
	console.error('Error starting the application:', err);
});
