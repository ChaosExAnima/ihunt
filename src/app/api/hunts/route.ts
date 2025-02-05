import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import {
	fetchAcceptedHunts,
	fetchCompletedHunts,
	fetchOpenHunts,
} from '@/lib/hunt';

export const GET = auth(async (req) => {
	if (!req.auth) {
		return NextResponse.json(
			{ message: 'Not authorized' },
			{
				status: 401,
			},
		);
	}
	const [accepted, open, completed] = await Promise.all([
		fetchAcceptedHunts(),
		fetchOpenHunts(),
		fetchCompletedHunts(),
	]);
	let hunts = [];
	if (accepted.length > 0) {
		hunts = [...accepted];
	} else {
		hunts = [...open];
	}

	return NextResponse.json({
		completed,
		hunts,
	});
});
