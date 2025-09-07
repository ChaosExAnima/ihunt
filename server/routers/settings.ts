import z from 'zod';

import { db } from '../db';
import { uploadPhoto } from '../photo';
import { router, userProcedure } from '../trpc';

export const settingsRouter = router({
	updateAvatar: userProcedure
		.input(
			z.instanceof(FormData).transform((fd) =>
				z
					.object({
						photo: z.instanceof(File),
					})
					.parse(Object.fromEntries(fd.entries())),
			),
		)
		.mutation(async ({ ctx: { hunter }, input }) => {
			try {
				await uploadPhoto({
					buffer: await input.photo.bytes(),
					hunterId: hunter.id,
					name: input.photo.name,
				});
				return { success: true };
			} catch (error) {
				console.error('Error uploading avatar:', error);
				return { success: false };
			}
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

	updateMoney: userProcedure.mutation(async ({ ctx: { user } }) => {
		await db.user.update({
			data: {
				hideMoney: !user.hideMoney,
			},
			where: { id: user.id },
		});
	}),
});
