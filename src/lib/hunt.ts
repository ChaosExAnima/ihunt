'use server';

import { huntDisplayInclude, HuntStatus, HuntStatusValues } from './constants';
import { db } from './db';
import { HuntSchema, huntsSchema } from './schemas';
import { sessionToHunter } from './user';

export type AdminHunts = { [key in HuntStatusValues]?: HuntSchema[] };

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
		return { accepted: false, huntId: id };
	}
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
	return { accepted: true, huntId: id };
}

export async function isHuntActive(): Promise<boolean> {
	const user = await sessionToHunter();
	const activeHunt = await db.hunt.findFirst({
		where: {
			hunters: {
				some: {
					id: user.id,
				},
			},
			status: HuntStatus.Active,
		},
	});
	return activeHunt !== null;
}

export async function fetchAllPublicHunts(): Promise<HuntSchema[]> {
	return huntsSchema.parse(
		await db.hunt.findMany({
			include: huntDisplayInclude,
			orderBy: [
				{
					status: 'asc',
				},
				{
					createdAt: 'desc',
				},
			],
			where: {
				status: {
					in: [HuntStatus.Active, HuntStatus.Available],
				},
			},
		}),
	);
}

export async function fetchActiveHunts(): Promise<HuntSchema[]> {
	const user = await sessionToHunter();
	return huntsSchema.parse(
		await db.hunt.findMany({
			include: huntDisplayInclude,
			where: {
				hunters: {
					some: {
						id: user.id,
					},
				},
				status: HuntStatus.Active,
			},
		}),
	);
}

export async function fetchCompletedHunts(): Promise<HuntSchema[]> {
	const user = await sessionToHunter();
	return huntsSchema.parse(
		await db.hunt.findMany({
			include: huntDisplayInclude,
			where: {
				hunters: {
					some: {
						id: user.id,
					},
				},
				status: HuntStatus.Complete,
			},
		}),
	);
}

export async function fetchOpenHunts(): Promise<HuntSchema[]> {
	return huntsSchema.parse(
		await db.hunt.findMany({
			include: huntDisplayInclude,
			where: {
				status: HuntStatus.Available,
			},
		}),
	);
}
