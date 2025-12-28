import z from 'zod';

import {
	huntSchema,
	huntStatus,
	idSchemaCoerce,
	photoHuntSchema,
} from '@/lib/schemas';

export const outputHuntSchema = huntSchema.extend({
	invites: z
		.array(z.object({ id: idSchemaCoerce }))
		.transform((invites) => invites.length > 0)
		.optional(),
	photos: z.array(photoHuntSchema),
	rating: z.coerce.number().min(0).max(5).default(0),
	status: z.string().transform((status) => huntStatus.parse(status)),
});

export const InviteStatus = {
	Accepted: 'accepted',
	Expired: 'expired',
	Pending: 'pending',
} as const;
export const inviteStatusSchema = z.enum(['pending', 'expired', 'accepted']);
export type InviteStatusSchema = z.infer<typeof inviteStatusSchema>;
