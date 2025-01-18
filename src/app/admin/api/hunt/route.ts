import type { CreateParams } from 'react-admin';

import { huntSchema } from '@/lib/constants';
import { db } from '@/lib/db';
import { Hunt, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import {
	createHandler,
	defaultHandler,
	getListHandler,
	RaPayload,
} from 'ra-data-simple-prisma';

const route = async (req: Request) => {
	const body: RaPayload<'Hunt'> = await req.json();

	switch (body.method) {
		case 'create': {
			const { data: rawData } = body.params as CreateParams<Hunt>;
			const data = huntSchema.parse(rawData);
			body.params.data = data;
			try {
				const result = await createHandler<Prisma.HuntCreateArgs>(
					body,
					db.hunt,
				);

				return NextResponse.json(result);
			} catch (err) {
				if (err instanceof Error) {
					console.log(err.stack);
				} else {
					console.error(err);
				}
			}
			return NextResponse.error();
		}
		case 'getList': {
			const result = await getListHandler<Prisma.HuntFindManyArgs>(
				body,
				db.hunt,
				{
					include: {
						hunters: {
							include: {
								avatar: true,
							},
						},
					},
				},
			);
			return NextResponse.json(result);
		}
		default: {
			const result = await defaultHandler(body, db);
			return NextResponse.json(result);
		}
	}
};

export { route as GET, route as POST };
