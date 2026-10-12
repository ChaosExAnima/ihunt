import {
	huntSchema,
	huntStatus,
	notifyTypeSchema,
	photoHuntSchema,
} from '@ihunt/lib/schemas';
import * as z from 'zod';

export const outputHuntSchema = huntSchema.extend({
	photos: photoHuntSchema.array(),
	rating: z.coerce.number().min(0).max(5).default(0),
	status: z.string().transform((status) => huntStatus.parse(status)),
});

export const HuntSpotStatus = {
	Empty: 'empty',
	Locked: 'locked',
	Taken: 'taken',
} as const;
export const huntSpotStatusSchema = z.enum(Object.values(HuntSpotStatus));
export type HuntSpotStatusSchema = z.infer<typeof huntSpotStatusSchema>;

export const subscriptionSchema = z.object({
	endpoint: z.url(),
	expirationTime: z.int().positive().nullish(),
	keys: z.object({
		auth: z.string(),
		p256dh: z.string(),
	}),
});
export type SubscriptionSchema = z.infer<typeof subscriptionSchema>;

export const userSettingsSchema = z.object({
	hideMoney: z.boolean(),
	notifications: z.partialRecord(notifyTypeSchema, z.boolean()),
});

export const userSettingsDatabaseSchema = userSettingsSchema
	.nullable()
	.transform((arg) => arg ?? undefined)
	.default({
		hideMoney: false,
		notifications: {},
	});
