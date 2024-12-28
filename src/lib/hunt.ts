'use server';

import { Prisma } from '@prisma/client';

import { HuntStatus } from './constants';
import { db } from './db';
import { fetchCurrentUser } from './user';

export async function fetchAcceptedHunts(include: Prisma.HuntInclude = {}) {
	const user = await fetchCurrentUser();
	return db.hunt.findMany({
		include,
		where: {
			hunters: {
				some: {
					id: user.id,
				},
			},
			status: HuntStatus.Active,
		},
	});
}

export async function fetchCompletedHunts(include: Prisma.HuntInclude = {}) {
	const user = await fetchCurrentUser();
	return db.hunt.findMany({
		include,
		where: {
			hunters: {
				some: {
					id: user.id,
				},
			},
			status: HuntStatus.Complete,
		},
	});
}

export async function fetchOpenHunts(include: Prisma.HuntInclude = {}) {
	const user = await fetchCurrentUser();
	return db.hunt.findMany({
		include,
		where: {
			minRating: {
				lte: user.rating,
			},
			status: HuntStatus.Available,
		},
	});
}
