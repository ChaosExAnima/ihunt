import { router } from '@/server/lib/trpc';

import { adminRouter } from './routers/admin';
import { apiRouter } from './routers/api';
import { authRouter } from './routers/auth';
import { huntRouter } from './routers/hunt';
import { hunterRouter } from './routers/hunter';
import { inviteRouter } from './routers/invite';
import { notifyRouter } from './routers/notify';
import { photosRouter } from './routers/photos';
import { settingsRouter } from './routers/settings';

export const appRouter = router({
	admin: adminRouter,
	api: apiRouter,
	auth: authRouter,
	hunt: huntRouter,
	hunter: hunterRouter,
	invite: inviteRouter,
	notify: notifyRouter,
	photos: photosRouter,
	settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
