import { config } from '../lib/config';
import { publicProcedure, router } from '../lib/trpc';

export const apiRouter = router({
	hello: publicProcedure.query(() => {
		return {
			message: 'API is up and running',
			status: 'ok',
			publicHost: config.publicHost,
			lanHost: config.lanHost,
		};
	}),
});
