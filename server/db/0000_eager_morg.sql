-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "User" (
	"id" serial PRIMARY KEY NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"run" integer DEFAULT 1 NOT NULL,
	"settings" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"hunterId" integer
);
--> statement-breakpoint
CREATE TABLE "HunterGroup" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "HuntInvite" (
	"id" serial PRIMARY KEY NOT NULL,
	"fromHunterId" integer NOT NULL,
	"toHunterId" integer NOT NULL,
	"huntId" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expiresAt" timestamp(3) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Hunt" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"scheduledAt" timestamp(3),
	"completedAt" timestamp(3),
	"name" text NOT NULL,
	"description" text NOT NULL,
	"place" text,
	"warnings" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"danger" integer DEFAULT 1 NOT NULL,
	"maxHunters" integer DEFAULT 5 NOT NULL,
	"minRating" integer DEFAULT 0 NOT NULL,
	"rating" double precision,
	"comment" text,
	"payment" integer NOT NULL,
	"paidHunters" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UserVapid" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"payload" text NOT NULL,
	"expirationTime" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "Photo" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"blurry" text,
	"hunterId" integer,
	"huntId" integer
);
--> statement-breakpoint
CREATE TABLE "Hunter" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"handle" text NOT NULL,
	"alive" boolean DEFAULT true NOT NULL,
	"avatarId" integer,
	"money" integer DEFAULT 0 NOT NULL,
	"groupId" integer,
	"bio" text,
	"pronouns" text,
	"type" text,
	"rating" double precision DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_HuntToHunter" (
	"A" integer NOT NULL,
	"B" integer NOT NULL,
	CONSTRAINT "_HuntToHunter_AB_pkey" PRIMARY KEY("B","A")
);
--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_hunterId_fkey" FOREIGN KEY ("hunterId") REFERENCES "public"."Hunter"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "HuntInvite" ADD CONSTRAINT "HuntInvite_fromHunterId_fkey" FOREIGN KEY ("fromHunterId") REFERENCES "public"."Hunter"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "HuntInvite" ADD CONSTRAINT "HuntInvite_toHunterId_fkey" FOREIGN KEY ("toHunterId") REFERENCES "public"."Hunter"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "HuntInvite" ADD CONSTRAINT "HuntInvite_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "public"."Hunt"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "UserVapid" ADD CONSTRAINT "UserVapid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_hunterId_fkey" FOREIGN KEY ("hunterId") REFERENCES "public"."Hunter"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "public"."Hunt"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Hunter" ADD CONSTRAINT "Hunter_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "public"."Photo"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Hunter" ADD CONSTRAINT "Hunter_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."HunterGroup"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_HuntToHunter" ADD CONSTRAINT "_HuntToHunter_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Hunt"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_HuntToHunter" ADD CONSTRAINT "_HuntToHunter_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Hunter"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "User_hunterId_key" ON "User" USING btree ("hunterId" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_password_key" ON "User" USING btree ("password" text_ops);--> statement-breakpoint
CREATE INDEX "HuntInvite_expiresAt_idx" ON "HuntInvite" USING btree ("expiresAt" timestamp_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "HuntInvite_fromHunterId_huntId_toHunterId_key" ON "HuntInvite" USING btree ("fromHunterId" int4_ops,"huntId" int4_ops,"toHunterId" int4_ops);--> statement-breakpoint
CREATE INDEX "toHunterStatus" ON "HuntInvite" USING btree ("toHunterId" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "Hunt_scheduledAt_idx" ON "Hunt" USING btree ("scheduledAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "Hunt_status_idx" ON "Hunt" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "UserVapid_userId_expirationTime_idx" ON "UserVapid" USING btree ("userId" int4_ops,"expirationTime" int4_ops);--> statement-breakpoint
CREATE INDEX "Photo_huntId_hunterId_idx" ON "Photo" USING btree ("huntId" int4_ops,"hunterId" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Photo_path_key" ON "Photo" USING btree ("path" text_ops);--> statement-breakpoint
CREATE INDEX "Hunter_alive_idx" ON "Hunter" USING btree ("alive" bool_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Hunter_avatarId_key" ON "Hunter" USING btree ("avatarId" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Hunter_handle_key" ON "Hunter" USING btree ("handle" text_ops);--> statement-breakpoint
CREATE INDEX "_HuntToHunter_B_index" ON "_HuntToHunter" USING btree ("B" int4_ops);
*/