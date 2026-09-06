CREATE TABLE `audits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organizationId` text NOT NULL,
	`entityId` text NOT NULL,
	`action` text NOT NULL,
	`before` text,
	`after` text,
	`actor` text NOT NULL,
	`timestamp` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audits_org` ON `audits` (`organizationId`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`organizationId` text NOT NULL,
	`userId` text NOT NULL,
	`role` text NOT NULL,
	`name` text NOT NULL,
	`studentId` text,
	`department` text,
	FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`ownerId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`organizationId` text NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`updatedBy` text,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_records_org_kind` ON `records` (`organizationId`,`kind`);--> statement-breakpoint
CREATE TRIGGER audit_record_update AFTER UPDATE ON records WHEN NEW.kind IN ('inventory','book','loan','record','submission','request') BEGIN INSERT INTO audits (organizationId,entityId,action,before,after,actor,timestamp) VALUES (NEW.organizationId,NEW.id,'Updated ' || NEW.kind,json_object('quantity',OLD.quantity,'data',json(OLD.data)),json_object('quantity',NEW.quantity,'data',json(NEW.data)),COALESCE(NEW.updatedBy,'system'),NEW.updatedAt); END;
