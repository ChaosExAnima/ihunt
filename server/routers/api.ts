import { publicProcedure, router } from '@/server/lib/trpc';

export const apiRouter = router({
	hello: publicProcedure.query(() => {
		return {
			message: 'API is up and running',
			status: 'ok',
		};
	}),
});
