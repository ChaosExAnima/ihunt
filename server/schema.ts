import z from 'zod';

import { huntSchema, huntStatus, photoHuntSchema } from '@/lib/schemas';

export const outputHuntSchema = huntSchema.extend({
	photos: z.array(photoHuntSchema),
	rating: z.coerce.number().min(0).max(5).default(0),
	status: z.string().transform((status) => huntStatus.parse(status)),
});
