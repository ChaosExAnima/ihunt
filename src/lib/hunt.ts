'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { HuntModel, HuntStatus, HuntStatusValues } from './constants';
import { db } from './db';
import { sessionToHunter } from './user';

export type AdminHunts = { [key in HuntStatusValues]?: HuntModel[] };

export async function acceptHunt(id: number) {
	const user = await sessionToHunter();
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
		await db.hunt.update({
			data: {
				hunters: {
					connect: {
						id: user.id,
					},
				},
			},
			where: { id },
		});
		console.log(`${user.name} accepted hunt with ID ${id}`);
	}

	revalidatePath('/hunts');
	revalidatePath('/admin/hunts');
}

export async function fetchAcceptedHunts(include: Prisma.HuntInclude = {}) {
	const user = await sessionToHunter();
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
	const user = await sessionToHunter();
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
	return db.hunt.findMany({
		include,
		where: {
			status: HuntStatus.Available,
		},
	});
}
