import z from 'zod';

import {
	hunterSchema,
	huntSchema,
	idSchemaCoerce,
	photoSchema,
	posIntSchema,
} from '@/lib/schemas';

export const resourceSchema = z.enum(['hunt', 'hunter', 'user', 'photo']);
export type Resources = z.infer<typeof resourceSchema>;

export const adminHuntSchema = huntSchema.omit({ hunters: true, photos: true });

export const adminHunterSchema = hunterSchema
	.omit({
		avatar: true,
	})
	.merge(
		z.object({
			alive: z.boolean(),
			avatarId: idSchemaCoerce.nullish(),
			userId: idSchemaCoerce.nullish(),
		}),
	);

export const adminPhotoSchema = photoSchema.merge(
	z.object({
		height: posIntSchema,
		hunterId: idSchemaCoerce.nullish(),
		huntId: idSchemaCoerce.nullish(),
		id: idSchemaCoerce,
		width: posIntSchema,
	}),
);

export const adminUserSchema = z.object({
	hideMoney: z.boolean(),
	id: idSchemaCoerce,
	name: z.string().nullable(),
	run: posIntSchema.default(1),
});

export function createAdminInput({
	extra,
	partial,
}: {
	extra?: z.AnyZodObject;
	partial?: boolean;
}) {
	const defaultUnion = [
		z.object({
			data: adminHuntSchema.omit({ id: true }),
			resource: z.literal('hunt'),
		}),
		z.object({
			data: adminHunterSchema.omit({ id: true }),
			resource: z.literal('hunter'),
		}),
		z.object({
			data: adminPhotoSchema.omit({ id: true }),
			resource: z.literal('photo'),
		}),
		z.object({
			data: adminUserSchema.omit({ id: true }),
			resource: z.literal('user'),
		}),
	] as const;
	defaultUnion.forEach((obj) => {
		if (extra) {
			obj.merge(extra);
		}
		if (partial) {
			obj.extend({
				data: obj.shape.data.partial(),
			});
		}
	});
	return z.discriminatedUnion('resource', defaultUnion);
}
