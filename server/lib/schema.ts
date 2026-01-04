import * as z from 'zod';

import { huntSchema, huntStatus, photoHuntSchema } from '@/lib/schemas';

export const outputHuntSchema = huntSchema.extend({
	photos: photoHuntSchema.array(),
	rating: z.coerce.number().min(0).max(5).default(0),
	status: z.string().transform((status) => huntStatus.parse(status)),
});

export const InviteStatus = {
	Accepted: 'accepted',
	Expired: 'expired',
	Pending: 'pending',
	Rejected: 'rejected',
} as const;
export const inviteStatusSchema = z.enum([
	'pending',
	'expired',
	'accepted',
	'rejected',
]);
export type InviteStatusSchema = z.infer<typeof inviteStatusSchema>;

export const subscriptionSchema = z.object({
	endpoint: z.url(),
	expirationTime: z.int().positive().nullish(),
	keys: z.object({
		auth: z.string(),
		p256dh: z.string(),
	}),
});
export type SubscriptionSchema = z.infer<typeof subscriptionSchema>;
