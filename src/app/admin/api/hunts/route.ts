import { fetchAdminHunts } from '@/lib/hunt';
import { NextResponse } from 'next/server';

export async function GET() {
	const hunts = await fetchAdminHunts();

	return NextResponse.json(hunts);
}
