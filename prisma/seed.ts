import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { HunterTypes, HuntStatus } from '@/lib/constants';
import { handleToHash } from '@/server/lib/auth';
import { db, Prisma } from '@/server/lib/db';
import { uploadPhoto } from '@/server/lib/photo';

async function main() {
	try {
		await db.hunterGroup.createMany({
			data: [
				{
					id: 1,
					name: 'NPCs Anonymous',
				},
				{
					id: 2,
					name: 'Team Techie',
				},
				{
					id: 3,
					name: 'Dropouts',
				},
				{
					id: 4,
					name: 'Fang Fans',
				},
			],
		});

		const hunters = (
			[
				{
					name: 'Steve',
					handle: 'g00db0i',
					type: HunterTypes.Phooey,
					groupId: 1,
				},
				{
					name: 'Edgar',
					handle: 'hailseitan',
					type: HunterTypes.Evileena,
					groupId: 4,
				},
				{
					name: 'Bonnie',
					handle: 'oldwest',
					type: HunterTypes.Knight,
					groupId: 3,
				},
				{
					name: 'Giles',
					handle: 'libraryguy',
					type: HunterTypes.Evileena,
					groupId: 2,
				},
				{
					name: 'Buffy',
					handle: 'theslayer',
					type: HunterTypes.Knight,
					groupId: 1,
				},
				{
					name: 'Sam',
					handle: 'nerdgirl',
					type: HunterTypes.SixtySixer,
					groupId: 2,
				},
				{
					name: 'Jess',
					handle: 'GoodTimeBadTime',
					type: HunterTypes.SixtySixer,
					groupId: 2,
				},
				{
					name: 'Frankie',
					handle: 'wolfgirrl',
					type: HunterTypes.Knight,
					groupId: 3,
				},
				{
					name: 'Roger',
					handle: '6669420',
					type: HunterTypes.SixtySixer,
					groupId: 3,
				},
				{
					name: 'Rey',
					handle: 'love2slay',
					type: HunterTypes.Phooey,
					groupId: 4,
				},
			] satisfies Prisma.HunterCreateManyInput[]
		).map(
			(row, index) =>
				({
					...row,
					id: index + 1,
					userId: index + 1,
					rating: 3,
					alive: true,
				}) satisfies Prisma.HunterCreateManyInput,
		);

		await db.user.createMany({
			data: await Promise.all(
				hunters.map(
					async ({ userId, handle }) =>
						({
							id: userId,
							name: `Test ${userId}`,
							password: await handleToHash(handle),
							run: 1,
						}) satisfies Prisma.UserCreateManyInput,
				),
			),
		});

		await db.hunter.createMany({
			data: hunters,
		});

		await db.hunt.createMany({
			data: [
				{
					id: 1,
					name: 'Werewolf',
					status: HuntStatus.Available,
					description:
						'saw something wandering around in the woods. hearing howls.',
					danger: 2,
					payment: 1000,
				},
				{
					id: 2,
					name: 'Vampire',
					status: HuntStatus.Available,
					description: 'a body was found without blood',
					danger: 3,
					payment: 2000,
				},
				{
					id: 3,
					name: 'Zombie',
					status: HuntStatus.Pending,
					description:
						'something like a dozen zombies in the old graveyard. €500 a head.',
					danger: 1,
					payment: 6000,
				},
				{
					id: 4,
					name: 'Ancient Vampire',
					status: HuntStatus.Complete,
					description: 'very old dangerous vampire!',
					danger: 3,
					payment: 10_000,
				},
			],
		});
		await db.hunt.update({
			data: {
				hunters: {
					set: hunters
						.filter(({ groupId }) => groupId === 4)
						.map(({ id }) => ({ id })),
				},
			},
			where: {
				id: 4,
			},
		});

		const photos = [
			{
				filename: 'werewolf.jpg',
				huntId: 1,
			},
			{
				filename: 'vampire.jpg',
				huntId: 2,
			},
			{
				filename: 'zombies.jpg',
				huntId: 3,
			},
			{
				filename: 'ancient_vampire.jpg',
				huntId: 4,
			},
		];
		for (const photo of photos) {
			const buffer = await readFile(
				resolve(import.meta.dirname, 'fixtures', photo.filename),
			);
			await uploadPhoto({
				buffer,
				huntId: photo.huntId,
			});
		}
	} catch (err) {
		console.log('Error seeding database:', err);
	} finally {
		await db.$disconnect();
	}
}

main()
	.then(() => process.exit())
	.catch((err: unknown) => {
		console.error(`Fatal:`, err);
		process.exit(1);
	});
