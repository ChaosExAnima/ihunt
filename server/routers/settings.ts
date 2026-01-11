import * as z from 'zod';

import { mergeDeep } from '@/lib/utils';
import { db } from '@/server/lib/db';
import { uploadPhoto } from '@/server/lib/photo';
import { router, userProcedure } from '@/server/lib/trpc';

import { handleError, wrapRoute } from '../lib/error';
import { userSettingsSchema } from '../lib/schema';

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
			} catch (err) {
				handleError({ err });
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

				try {
					await db.hunter.update({
						data: { bio: newBio, pronouns: newPronouns },
						where: { id: hunter.id },
					});
				} catch (err) {
					handleError({ err });
				}
			},
		),

	updateSettings: userProcedure
		.input(userSettingsSchema.partial())
		.mutation(async ({ ctx: { user }, input }) =>
			wrapRoute(async () => {
				const updated = await db.user.update({
					data: {
						settings: mergeDeep(user.settings, input),
					},
					where: { id: user.id },
				});
				return updated.settings;
			}),
		),
});
