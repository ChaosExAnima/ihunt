import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { idSchema, parseRequestBody, returnError } from '@/lib/api';
import { auth } from '@/lib/auth';
import { acceptHunt, fetchAcceptedHunts, fetchOpenHunts } from '@/lib/hunt';

export const GET = auth(async (req) => {
	if (!req.auth) {
		return returnError('Not authorized', 401);
	}
	const [accepted, open] = await Promise.all([
		fetchAcceptedHunts(),
		fetchOpenHunts(),
	]);
	let hunts = [];
	if (accepted.length > 0) {
		hunts = accepted;
	} else {
		hunts = open;
	}

	return NextResponse.json(hunts);
});

export const POST = auth(async (req) => {
	if (!req.auth) {
		return returnError('Not authorized', 401);
	}
	try {
		const { id } = await parseRequestBody(req, z.object({ id: idSchema }));
		const response = await acceptHunt(id);
		return NextResponse.json({ ...response, success: true });
	} catch (err) {
		console.log('Error accepting hunt:', err);
		if (err instanceof z.ZodError) {
			return returnError('Invalid request', 400);
		} else if (err instanceof Prisma.PrismaClientKnownRequestError) {
			if (err.code === 'P2025') {
				return returnError('Hunt not found', 404);
			}
		} else if (err instanceof Error) {
			return returnError('Cannot accept hunt', 400);
		}
		return returnError('An error occurred');
	}
});
