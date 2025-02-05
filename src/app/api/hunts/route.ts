import { NextResponse } from 'next/server';

import { huntDisplayInclude } from '@/lib/constants';
import {
	fetchAcceptedHunts,
	fetchCompletedHunts,
	fetchOpenHunts,
} from '@/lib/hunt';

export async function GET() {
	const [accepted, open, completed] = await Promise.all([
		fetchAcceptedHunts(huntDisplayInclude),
		fetchOpenHunts(huntDisplayInclude),
		fetchCompletedHunts(huntDisplayInclude),
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
