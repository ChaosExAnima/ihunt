import { NextResponse } from 'next/server';

import {
	fetchAcceptedHunts,
	fetchCompletedHunts,
	fetchOpenHunts,
} from '@/lib/hunt';

export async function GET() {
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
}
