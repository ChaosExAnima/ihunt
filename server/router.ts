import { apiRouter } from './routers/api';
import { authRouter } from './routers/auth';
import { huntRouter } from './routers/hunt';
import { hunterRouter } from './routers/hunter';
import { photosRouter } from './routers/photos';
import { settingsRouter } from './routers/settings';
import { router } from './trpc';

export const appRouter = router({
	api: apiRouter,
	auth: authRouter,
	hunt: huntRouter,
	hunter: hunterRouter,
	photos: photosRouter,
	settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
