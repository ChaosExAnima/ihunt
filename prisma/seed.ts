import { HuntStatus } from '@/lib/constants';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
	try {
		await Promise.all([db]);
		await db.hunt.createMany({
			data: [
				{
					description:
						'saw something wandering around in the woods. hearing howls.',
					id: 1,
					maxHunters: 2,
					minRating: 1,
					name: 'Werewolf',
					status: HuntStatus.Available,
				},
				{
					description: 'a body was found without blood',
					id: 2,
					maxHunters: 1,
					minRating: 5,
					name: 'Vampire',
					status: HuntStatus.Available,
				},
				{
					description: 'brains',
					id: 3,
					maxHunters: 3,
					minRating: 3,
					name: 'Zombie',
					status: HuntStatus.Pending,
				},
				{
					description: 'very old dangerous vampire!',
					id: 4,
					maxHunters: 1,
					minRating: 1,
					name: 'Ashed Vampire',
					status: HuntStatus.Complete,
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
					id: 4,
					path: 'velma.png',
					width: 844,
				},
				{
					height: 1024,
					id: 5,
					path: 'dean.png',
					width: 1048,
				},
				{
					height: 1086,
					id: 6,
					path: 'buffy.jpg',
					width: 1036,
				},
				{
					height: 1024,
					id: 7,
					path: 'vampire.webp',
					width: 1024,
				},
			],
		});
		await db.hunter.createMany({
			data: [
				{
					avatarId: 5,
					email: 'dean@ihunt.de',
					id: 1,
					name: 'Dean',
					rating: 1,
					userId: '1',
				},
				{
					avatarId: 4,
					email: 'velma@ihunt.de',
					id: 2,
					name: 'Velma',
					rating: 3,
					userId: '2',
				},
				{
					avatarId: 6,
					email: 'buffy@ihunt.de',
					id: 3,
					name: 'Buffy',
					rating: 5,
					userId: '3',
				},
			],
		});
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
