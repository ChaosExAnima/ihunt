import { sql } from 'drizzle-orm';
import {
	pgTable,
	uniqueIndex,
	foreignKey,
	serial,
	text,
	integer,
	jsonb,
	timestamp,
	index,
	doublePrecision,
	boolean,
	primaryKey,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
	'User',
	{
		id: serial().primaryKey().notNull(),
		password: text().notNull(),
		name: text(),
		run: integer().default(1).notNull(),
		settings: jsonb(),
		createdAt: timestamp({ precision: 3, mode: 'string' })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
		hunterId: integer(),
	},
	(table) => [
		uniqueIndex('User_hunterId_key').using(
			'btree',
			table.hunterId.asc().nullsLast().op('int4_ops'),
		),
		uniqueIndex('User_password_key').using(
			'btree',
			table.password.asc().nullsLast().op('text_ops'),
		),
		foreignKey({
			columns: [table.hunterId],
			foreignColumns: [hunters.id],
			name: 'User_hunterId_fkey',
		})
			.onUpdate('cascade')
			.onDelete('set null'),
	],
);

export const hunterGroups = pgTable('HunterGroup', {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
});

export const huntInvites = pgTable(
	'HuntInvite',
	{
		id: serial().primaryKey().notNull(),
		fromHunterId: integer().notNull(),
		toHunterId: integer().notNull(),
		huntId: integer().notNull(),
		createdAt: timestamp({ precision: 3, mode: 'string' })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		expiresAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
		status: text().default('pending').notNull(),
	},
	(table) => [
		index('HuntInvite_expiresAt_idx').using(
			'btree',
			table.expiresAt.asc().nullsLast().op('timestamp_ops'),
		),
		uniqueIndex('HuntInvite_fromHunterId_huntId_toHunterId_key').using(
			'btree',
			table.fromHunterId.asc().nullsLast().op('int4_ops'),
			table.huntId.asc().nullsLast().op('int4_ops'),
			table.toHunterId.asc().nullsLast().op('int4_ops'),
		),
		index('toHunterStatus').using(
			'btree',
			table.toHunterId.asc().nullsLast().op('text_ops'),
			table.status.asc().nullsLast().op('text_ops'),
		),
		foreignKey({
			columns: [table.fromHunterId],
			foreignColumns: [hunters.id],
			name: 'HuntInvite_fromHunterId_fkey',
		})
			.onUpdate('cascade')
			.onDelete('restrict'),
		foreignKey({
			columns: [table.toHunterId],
			foreignColumns: [hunters.id],
			name: 'HuntInvite_toHunterId_fkey',
		})
			.onUpdate('cascade')
			.onDelete('restrict'),
		foreignKey({
			columns: [table.huntId],
			foreignColumns: [hunts.id],
			name: 'HuntInvite_huntId_fkey',
		})
			.onUpdate('cascade')
			.onDelete('restrict'),
	],
);

export const hunts = pgTable(
	'Hunt',
	{
		id: serial().primaryKey().notNull(),
		createdAt: timestamp({ precision: 3, mode: 'string' })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		scheduledAt: timestamp({ precision: 3, mode: 'string' }),
		completedAt: timestamp({ precision: 3, mode: 'string' }),
		name: text().notNull(),
		description: text().notNull(),
		place: text(),
		warnings: text(),
		status: text().default('pending').notNull(),
		danger: integer().default(1).notNull(),
		maxHunters: integer().default(5).notNull(),
		minRating: integer().default(0).notNull(),
		rating: doublePrecision(),
		comment: text(),
		payment: integer().notNull(),
		paidHunters: boolean().default(false).notNull(),
	},
	(table) => [
		index('Hunt_scheduledAt_idx').using(
			'btree',
			table.scheduledAt.asc().nullsLast().op('timestamp_ops'),
		),
		index('Hunt_status_idx').using(
			'btree',
			table.status.asc().nullsLast().op('text_ops'),
		),
	],
);

export const userVapids = pgTable(
	'UserVapid',
	{
		id: text().primaryKey().notNull(),
		userId: integer().notNull(),
		payload: text().notNull(),
		expirationTime: timestamp({ precision: 3, mode: 'string' }),
	},
	(table) => [
		index('UserVapid_userId_expirationTime_idx').using(
			'btree',
			table.userId.asc().nullsLast().op('int4_ops'),
			table.expirationTime.asc().nullsLast().op('int4_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'UserVapid_userId_fkey',
		})
			.onUpdate('cascade')
			.onDelete('restrict'),
	],
);

export const photos = pgTable(
	'Photo',
	{
		id: serial().primaryKey().notNull(),
		path: text().notNull(),
		width: integer().notNull(),
		height: integer().notNull(),
		blurry: text(),
		hunterId: integer(),
		huntId: integer(),
	},
	(table) => [
		index('Photo_huntId_hunterId_idx').using(
			'btree',
			table.huntId.asc().nullsLast().op('int4_ops'),
			table.hunterId.asc().nullsLast().op('int4_ops'),
		),
		uniqueIndex('Photo_path_key').using(
			'btree',
			table.path.asc().nullsLast().op('text_ops'),
		),
		foreignKey({
			columns: [table.hunterId],
			foreignColumns: [hunters.id],
			name: 'Photo_hunterId_fkey',
		})
			.onUpdate('cascade')
			.onDelete('set null'),
		foreignKey({
			columns: [table.huntId],
			foreignColumns: [hunts.id],
			name: 'Photo_huntId_fkey',
		})
			.onUpdate('cascade')
			.onDelete('set null'),
	],
);

export const hunters = pgTable(
	'Hunter',
	{
		id: serial().primaryKey().notNull(),
		name: text().notNull(),
		handle: text().notNull(),
		alive: boolean().default(true).notNull(),
		avatarId: integer(),
		money: integer().default(0).notNull(),
		groupId: integer(),
		bio: text(),
		pronouns: text(),
		type: text(),
		rating: doublePrecision().default(1).notNull(),
	},
	(table) => [
		index('Hunter_alive_idx').using(
			'btree',
			table.alive.asc().nullsLast().op('bool_ops'),
		),
		uniqueIndex('Hunter_avatarId_key').using(
			'btree',
			table.avatarId.asc().nullsLast().op('int4_ops'),
		),
		uniqueIndex('Hunter_handle_key').using(
			'btree',
			table.handle.asc().nullsLast().op('text_ops'),
		),
		foreignKey({
			columns: [table.groupId],
			foreignColumns: [hunterGroups.id],
			name: 'Hunter_groupId_fkey',
		})
			.onUpdate('cascade')
			.onDelete('set null'),
	],
);

export const huntToHunter = pgTable(
	'_HuntToHunter',
	{
		a: integer('A').notNull(),
		b: integer('B').notNull(),
	},
	(table) => [
		index().using('btree', table.b.asc().nullsLast().op('int4_ops')),
		foreignKey({
			columns: [table.a],
			foreignColumns: [hunts.id],
			name: '_HuntToHunter_A_fkey',
		})
			.onUpdate('cascade')
			.onDelete('cascade'),
		foreignKey({
			columns: [table.b],
			foreignColumns: [hunters.id],
			name: '_HuntToHunter_B_fkey',
		})
			.onUpdate('cascade')
			.onDelete('cascade'),
		primaryKey({
			columns: [table.b, table.a],
			name: '_HuntToHunter_AB_pkey',
		}),
	],
);
