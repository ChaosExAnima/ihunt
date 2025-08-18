import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

async function start() {
	let App;
	if (window.location.pathname.startsWith('/admin')) {
		const admin = await import('@/admin/app');
		App = admin.App;
	} else {
		const app = await import('@/app');
		App = app.App;
	}

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
