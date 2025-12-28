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
				const photo = await uploadPhoto({
					buffer: await input.photo.bytes(),
					hunterId: hunter.id,
					name: input.photo.name,
				});
				await db.hunter.update({
					data: { avatarId: photo.id },
					where: { id: hunter.id },
				});
				return { success: true };
			} catch (error) {
				console.error('Error uploading avatar:', error);
				return { success: false };
			}
		}),

	updateFields: userProcedure
		.input(
			z.object({
				bio: z.string().trim().max(500).min(1).optional(),
				pronouns: z.string().trim().max(40).min(1).optional(),
			}),
		)
		.mutation(
			async ({
				ctx: { hunter },
				input: { bio: newBio, pronouns: newPronouns },
			}) => {
				if (newBio === hunter.bio && newPronouns === hunter.pronouns) {
					return;
				}
				await db.hunter.update({
					data: { bio: newBio, pronouns: newPronouns },
					where: { id: hunter.id },
				});
			},
		),

	updateMoney: userProcedure.mutation(async ({ ctx: { user } }) => {
		const { hideMoney } = await db.user.update({
			data: {
				hideMoney: !user.hideMoney,
			},
			where: { id: user.id },
		});
		return { hideMoney, success: true };
	}),
});
