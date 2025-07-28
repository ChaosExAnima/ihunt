import { apiRouter } from './routers/api';
import { authRouter } from './routers/auth';
import { huntRouter } from './routers/hunt';
import { hunterRouter } from './routers/hunter';
import { settingsRouter } from './routers/settings';
import { router } from './trpc';

export const appRouter = router({
	api: apiRouter,
	auth: authRouter,
	hunt: huntRouter,
	hunter: hunterRouter,
	settings: settingsRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
