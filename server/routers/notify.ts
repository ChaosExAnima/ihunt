import { ee, saveSubscription } from '../lib/notify';
import { subscriptionSchema } from '../lib/schema';
import { router, userProcedure } from '../lib/trpc';

export const notifyRouter = router({
	onNotify: userProcedure.subscription(async function* ({
		ctx: { user },
		signal,
	}) {
		const iterable = ee.toIterable('notify', {
			signal,
		});

		// yield any new posts from the event emitter
		for await (const [userId, payload] of iterable) {
			if (user.id === userId) {
				console.log('yielding:', payload, 'to', userId);
				yield payload;
			}
		}
	}),

	subscribe: userProcedure
		.input(subscriptionSchema)
		.mutation(async ({ ctx: { user }, input }) => {
			const subscription = await saveSubscription({
				subscription: input,
				userId: user.id,
			});
			return {
				success: !!subscription,
			};
		}),
});
