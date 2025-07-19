import { apiRouter } from './routers/api';
import { huntRouter } from './routers/hunt';
import { hunterRouter } from './routers/hunter';
import { router } from './trpc';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const appRouter = router({
	api: apiRouter,
	hunt: huntRouter,
	hunter: hunterRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
