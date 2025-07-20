import z from 'zod';

import { db } from '../db';
import { router, userProcedure } from '../trpc';

export const settingsRouter = router({
	getHunter: userProcedure.query(({ ctx: { hunter } }) => {
		return hunter;
	}),

	logOut: userProcedure.mutation(({ ctx: { session } }) => {
		session.destroy();
	}),

	updateBio: userProcedure
		.input(z.string().trim().max(500).min(1))
		.mutation(async ({ ctx: { hunter }, input }) => {
			const newBio = input;
			if (!newBio || newBio === hunter.bio) {
				return;
			}
			await db.hunter.update({
				data: { bio: newBio },
				where: { id: hunter.id },
			});
		}),

	updateHandle: userProcedure
		.input(z.string().trim().max(50).min(1))
		.mutation(async ({ ctx: { hunter }, input }) => {
			const newHandle = input.replaceAll(/^[a-z0-9\-_]/g, '');
			if (!newHandle || newHandle === hunter.handle) {
				return;
			}
			await db.hunter.update({
				data: { handle: newHandle },
				where: { id: hunter.id },
			});
		}),

	updateMoney: userProcedure.mutation(async ({ ctx: { user } }) => {
		await db.user.update({
			data: {
				hideMoney: !user.hideMoney,
			},
			where: { id: user.id },
		});
	}),
});
