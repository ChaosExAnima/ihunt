import z from 'zod';

import { huntDisplayInclude } from '@/lib/constants';
import { idSchemaCoerce } from '@/lib/schemas';

import { db } from '../db';
import { authedProcedure, router } from '../trpc';

export const huntRouter = router({
	getOne: authedProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
			}),
		)
		.query(({ input }) => {
			const { huntId: id } = input;

			return db.hunt.findUnique({
				include: huntDisplayInclude,
				where: { id },
			});
		}),
});
