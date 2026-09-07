CREATE TABLE `teacher_class_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`organizationId` text NOT NULL,
	`classId` text NOT NULL,
	`date` text NOT NULL,
	`topic` text NOT NULL,
	`contentCovered` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`homework` text DEFAULT '' NOT NULL,
	`resources` text DEFAULT '[]' NOT NULL,
	`createdBy` text NOT NULL,
	`updatedBy` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`classId`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`createdBy`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updatedBy`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_class_logs_org_class_date` ON `teacher_class_logs` (`organizationId`,`classId`,`date`);