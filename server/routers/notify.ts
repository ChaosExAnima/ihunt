import z from 'zod';

import { idSchemaCoerce } from '@/lib/schemas';

import { ee, notifyUser, saveSubscription } from '../lib/notify';
import { subscriptionSchema } from '../lib/schema';
import { adminProcedure, router, userProcedure } from '../lib/trpc';

export const notifyRouter = router({
	message: adminProcedure
		.input(
			z.object({
				body: z.string().optional(),
				ids: z.array(idSchemaCoerce),
				title: z.string(),
			}),
		)
		.mutation(async ({ input: { body, ids, title } }) => {
			let sent = 0;
			for (const userId of ids) {
				const result = await notifyUser({ body, title, userId });
				if (result) {
					sent++;
				}
			}
			return {
				sent,
			};
		}),

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
