'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { HuntStatus } from './constants';
import { db } from './db';
import { fetchCurrentUser } from './user';

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

	revalidatePath(`/hunts`);
}

export async function logInAs(id: number) {
	console.log(`Logging in as ${id}`);
	const cookieStore = await cookies();
	cookieStore.set('user', id.toString());
	redirect('/hunts');
}
