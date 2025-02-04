import { PrismaClient } from '@prisma/client';

import { HuntStatus } from '@/lib/constants';

const db = new PrismaClient();

async function main() {
	try {
		await Promise.all([db]);
		await db.hunt.createMany({
			data: [
				{
					danger: 2,
					description:
						'saw something wandering around in the woods. hearing howls.',
					id: 1,
					maxHunters: 2,
					name: 'Werewolf',
					payment: 1_000,
					status: HuntStatus.Available,
				},
				{
					danger: 3,
					description: 'a body was found without blood',
					id: 2,
					maxHunters: 4,
					name: 'Vampire',
					payment: 10_000,
					status: HuntStatus.Available,
				},
				{
					danger: 1,
					description: 'brains',
					id: 3,
					maxHunters: 4,
					name: 'Zombie',
					payment: 20,
					status: HuntStatus.Pending,
				},
				{
					danger: 3,
					description: 'very old dangerous vampire!',
					id: 4,
					maxHunters: 1,
					name: 'Ashed Vampire',
					payment: 10_000,
					status: HuntStatus.Complete,
				},
			],
		});

		await db.user.createMany({
			data: [{ id: 'user1' }, { id: 'user2' }, { id: 'user3' }],
		});
		await db.hunter.createMany({
			data: [
				{
					id: 1,
					name: 'Dean',
					userId: 'user1',
				},
				{
					id: 2,
					name: 'Velma',
					userId: 'user2',
				},
				{
					id: 3,
					name: 'Buffy',
					userId: 'user3',
				},
			],
		});

		await db.photo.createMany({
			data: [
				{
					height: 1024,
					huntId: 1,
					id: 1,
					path: 'werewolf.webp',
					width: 1024,
				},
				{
					height: 1024,
					huntId: 2,
					id: 2,
					path: 'vampire.webp',
					width: 1024,
				},
				{
					height: 1114,
					huntId: 3,
					id: 3,
					path: 'zombie.png',
					width: 1230,
				},
				{
					height: 826,
					hunterId: 2,
					id: 4,
					path: 'velma.png',
					width: 844,
				},
				{
					height: 1024,
					hunterId: 1,
					id: 5,
					path: 'dean.png',
					width: 1048,
				},
				{
					height: 1086,
					hunterId: 3,
					id: 6,
					path: 'buffy.jpg',
					width: 1036,
				},
				{
					height: 1024,
					huntId: 4,
					id: 7,
					path: 'ash-vampire.webp',
					width: 1024,
				},
			],
		});
		await Promise.all([
			db.hunter.update({
				data: { avatarId: 5 },
				where: { id: 1 },
			}),
			db.hunter.update({
				data: { avatarId: 4 },
				where: { id: 2 },
			}),
			db.hunter.update({
				data: { avatarId: 6 },
				where: { id: 3 },
			}),
		]);
		await db.hunt.update({
			data: {
				hunters: {
					set: [
						{
							id: 3,
						},
					],
				},
			},
			where: {
				id: 4,
			},
		});
	} catch (err) {
		console.log('Error seeding database:', err);
	} finally {
		await db.$disconnect();
	}
}

main();
