'use server';

import { HuntModel } from '@/components/hunt/consts';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { HuntStatus } from './constants';
import { db } from './db';
import { fetchCurrentUser, forceAdmin } from './user';

export type AdminHunts = { [key in HuntStatus]?: HuntModel[] };

export async function acceptHunt(id: number) {
	const user = await fetchCurrentUser();
	const hunt = await db.hunt.findFirstOrThrow({
		select: {
			hunters: {
				select: { id: true },
			},
			maxHunters: true,
			status: true,
		},
		where: {
			id,
		},
	});
	if (hunt.status !== HuntStatus.Available) {
		throw new Error(`Hunt ${id} is not open to hunters`);
	}
	if (hunt.hunters.some((hunter) => hunter.id === user.id)) {
		await db.hunt.update({
			data: {
				hunters: {
					disconnect: {
						id: user.id,
					},
				},
			},
			where: { id },
		});
		console.log(`${user.name} canceled hunt with ID ${id}`);
	} else {
		const hunt = await db.hunt.update({
			data: {
				hunters: {
					connect: {
						id: user.id,
					},
				},
			},
			include: {
				hunters: { select: { id: true } },
			},
			where: { id },
		});
		if (hunt.hunters.length === hunt.maxHunters) {
			await db.hunt.update({
				data: { status: HuntStatus.Active },
				where: { id },
			});
		}
		console.log(`${user.name} accepted hunt with ID ${id}`);
	}

	revalidatePath('/hunts');
	revalidatePath('/admin/hunts');
}

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

export async function fetchAdminHunts() {
	await forceAdmin();
	const hunts = await db.hunt.findMany({
		include: {
			hunters: {
				include: {
					avatar: true,
				},
			},
			photos: true,
		},
		orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
		where: {
			status: {
				in: [
					HuntStatus.Active,
					HuntStatus.Available,
					HuntStatus.Pending,
				],
			},
		},
	});
	return hunts.reduce<AdminHunts>(
		(prev, hunt) => ({
			...prev,
			[hunt.status]: (prev[hunt.status as HuntStatus] ?? []).concat(hunt),
		}),
		{},
	);
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
