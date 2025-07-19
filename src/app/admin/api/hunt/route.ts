import type { CreateParams } from 'react-admin';

import { Hunt, Hunter, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import {
	createHandler,
	defaultHandler,
	getListHandler,
	getOneHandler,
	RaPayload,
	updateHandler,
} from 'ra-data-simple-prisma';

import { db } from '@/lib/db';
import { huntSchema } from '@/lib/schemas';

const route = async (req: Request) => {
	const body: RaPayload<'Hunt'> = await req.json();

	try {
		switch (body.method) {
			case 'create': {
				const { data: rawData } = body.params as CreateParams<Hunt>;
				const data = huntSchema.parse(rawData);
				body.params.data = data;
				const result = await createHandler<Prisma.HuntCreateArgs>(
					body,
					db,
				);

				return NextResponse.json(result);
			}
			case 'getList': {
				const result = await getListHandler<Prisma.HuntFindManyArgs>(
					body,
					db,
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
			case 'getOne': {
				const result = await getOneHandler<Prisma.HuntFindFirstArgs>(
					body,
					db,
					{
						include: {
							hunters: true,
						},
					},
				);
				result.data.hunters = result.data.hunters.map(
					(h: Hunter) => h.id,
				);
				return NextResponse.json(result);
			}
			case 'update': {
				const result = await updateHandler(body, db, {
					set: {
						hunterIds: {
							hunters: 'id',
						},
					},
				});
				return NextResponse.json(result);
			}
			default: {
				const result = await defaultHandler(body, db);
				return NextResponse.json(result);
			}
		}
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.stack);
		} else {
			console.error(err);
		}
		return NextResponse.json({ success: false });
	}
};

export { route as GET, route as POST };
