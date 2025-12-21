import z from 'zod';

import {
	hunterSchema,
	huntSchema,
	huntStatus,
	idSchema,
	photoSchema,
} from '@/lib/schemas';

import { outputPhoto } from './photo';

export const photoOutputSchema = photoSchema
	.omit({ url: true })
	.merge(
		z.object({
			hunterId: idSchema.nullable(),
			huntId: idSchema.nullable(),
			id: idSchema,
			path: z.string(),
		}),
	)
	.transform((photo) => outputPhoto({ photo }));

export const outputHunterSchema = hunterSchema.merge(
	z.object({
		avatar: photoOutputSchema.nullable(),
	}),
);

export const outputHuntSchema = huntSchema.merge(
	z.object({
		hunters: z.array(outputHunterSchema),
		photos: z.array(photoOutputSchema),
		rating: z
			.number()
			.min(0)
			.max(5)
			.nullable()
			.transform((arg) => arg ?? 0),
		status: z.string().transform((status) => huntStatus.parse(status)),
	}),
);
