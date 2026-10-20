import * as z from 'zod';

import {
	HUNT_MAX_DANGER,
	HuntStatus,
	ACCESS_CODE_REGEX,
	SpotStatus,
} from './constants';

export const authSchema = z.object({
	code: z
		.string({ error: 'Please enter your access code' })
		.toLowerCase()
		.regex(ACCESS_CODE_REGEX, 'Code must follow this pattern: A01'),
	password: z.string(),
});
export type AuthSchema = z.infer<typeof authSchema>;

export const posIntSchema = z.int().positive();

export const idSchema = posIntSchema.min(1);
export const idSchemaCoerce = z.preprocess(
	(arg) => (typeof arg === 'string' ? Number.parseInt(arg) : arg),
	idSchema,
);
export const idArray = idSchemaCoerce.array();

export const huntStatus = z.enum(HuntStatus);

export const photoSchema = z.object({
	blurry: z.string().nullable(),
	id: idSchema,
});
export type PhotoSchema = z.infer<typeof photoSchema>;

export const photoHuntSchema = photoSchema.extend(
	z.object({
		hunterId: idSchema.nullable(),
	}).shape,
);
export type PhotoHuntSchema = z.infer<typeof photoHuntSchema>;

export const hunterTypeSchema = z.enum([
	'evileena',
	'knight',
	'phooey',
	'66er',
]);
export type HunterTypeSchema = z.infer<typeof hunterTypeSchema>;

export const hunterSchema = z.object({
	avatar: photoSchema.nullable(),
	bio: z.string().nullish(),
	handle: z.string().min(6),
	id: idSchema,
	money: z.coerce.number().int().optional(),
	name: z.string(),
	pronouns: z.string().nullish(),
	rating: z.number().positive().max(5),
	type: z
		.string()
		.transform((type) => hunterTypeSchema.parse(type))
		.nullable(),
});
export type HunterSchema = z.infer<typeof hunterSchema>;

export const huntReservedSchema = z.object({
	expires: z.coerce.date(),
	status: z.enum(['invited', 'reserved', 'sent', 'declined']),
	count: z.int(),
});
export type HuntReservedSchema = z.infer<typeof huntReservedSchema>;
export type HuntReservedStatusSchema = HuntReservedSchema['status'];

export const spotStatus = z.enum(SpotStatus);

export const spotSchema = z.discriminatedUnion('state', [
	z.object({
		state: z.literal(SpotStatus.Empty),
	}),
	z.object({
		state: z.literal(SpotStatus.Locked),
		hunterId: idSchema,
		fromHunterId: idSchema.nullish(),
	}),
	z.object({
		state: z.literal(SpotStatus.Taken),
		hunterId: idSchema,
	}),
]);
export type SpotSchema = z.infer<typeof spotSchema>;

export const huntSchema = z.object({
	id: idSchema,
	name: z.string().min(1),
	description: z.string(),
	warnings: z.string().nullish(),
	danger: z.int().min(1).max(HUNT_MAX_DANGER),
	place: z.string().nullish(),
	payment: z.int().nonnegative(),
	photos: photoHuntSchema.array(),

	status: huntStatus,
	createdAt: z.coerce.date(),
	scheduledAt: z.coerce.date().nullable(),
	completedAt: z.coerce.date().nullable(),

	spots: spotSchema.array(),

	comment: z.string().nullable(),
	rating: z.coerce.number().min(0).max(5),
});
export type HuntSchema = z.infer<typeof huntSchema>;
export const huntsSchema = huntSchema.array();

export const groupSchema = z.object({
	hunters: hunterSchema.array(),
	id: idSchema,
	name: z.string(),
});
export type GroupSchema = z.infer<typeof groupSchema>;

export const notifyTypeSchema = z.enum([
	'message',
	'hunt-update',
	'hunt-starting',
	'hunt-complete',
	'invite-accept',
	'invite-decline',
	'invite-receive',
	'hunter-rating-low',
	'hunter-rating-top',
	'hunter-money-negative',
	'hunter-deactivated',
]);
export type NotifyTypeSchema = z.infer<typeof notifyTypeSchema>;

export const notifyEventSchema = z.object({
	body: z.string().optional(),
	icon: z.url().optional(),
	title: z.string().optional(),
	type: notifyTypeSchema,
	url: z.url().optional(),
	huntId: idSchema.optional(),
	hunterId: idSchema.optional(),
});
export type NotifyEventSchema = z.infer<typeof notifyEventSchema>;
