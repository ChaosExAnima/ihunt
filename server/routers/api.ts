import { config } from '../lib/config';
import { publicProcedure, router } from '../lib/trpc';

export const apiRouter = router({
	hello: publicProcedure.query(() => {
		const servers = config.serverHosts;
		return {
			message: 'API is up and running',
			status: 'ok',
			servers,
		};
	}),
});
