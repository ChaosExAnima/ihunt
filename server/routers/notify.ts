import * as z from 'zod';

import { idArray } from '@/lib/schemas';

import { handleError } from '../lib/error';
import { ee, notifyUser, saveSubscription } from '../lib/notify';
import { subscriptionSchema } from '../lib/schema';
import { adminProcedure, router, userProcedure } from '../lib/trpc';

export const notifyRouter = router({
	message: adminProcedure
		.input(
			z.object({
				body: z.string().optional(),
				ids: idArray,
				title: z.string(),
			}),
		)
		.mutation(async ({ input: { body, ids, title } }) => {
			let sent = 0;
			for (const userId of ids) {
				try {
					const result = await notifyUser({
						event: { body, title, type: 'message' },
						userId,
					});
					if (result) {
						sent++;
					}
				} catch (err) {
					handleError({ err, throws: false });
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
		const iterable = ee.toIterable('notify', { signal });

		console.log('user', user.id, 'subscribed to notify events');

		// yield any new posts from the event emitter
		try {
			for await (const [userId, payload] of iterable) {
				// Notify everyone except the original hunter on a join event.
				if (payload.type === 'hunt-join' && userId !== user.id) {
					yield payload;
				}

				// Otherwise, send the payload over.
				if (user.id === userId) {
					yield payload;
				}
			}
		} finally {
			console.log('user', user.id, 'unsubbed to events');
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
