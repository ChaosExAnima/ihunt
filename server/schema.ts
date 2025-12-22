import z from 'zod';

import { huntSchema, huntStatus, photoHuntSchema } from '@/lib/schemas';

export const outputHuntSchema = huntSchema.merge(
	z.object({
		photos: z.array(photoHuntSchema),
		rating: z
			.number()
			.min(0)
			.max(5)
			.nullable()
			.transform((arg) => arg ?? 0),
		status: z.string().transform((status) => huntStatus.parse(status)),
	}),
);
