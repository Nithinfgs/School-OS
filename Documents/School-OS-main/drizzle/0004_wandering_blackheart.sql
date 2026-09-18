DROP INDEX `idx_class_logs_org_class_date`;--> statement-breakpoint
ALTER TABLE `teacher_class_logs` ADD `period` text DEFAULT 'Daily' NOT NULL;--> statement-breakpoint
ALTER TABLE `teacher_class_logs` ADD `activities` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_class_logs_org_class_date_period` ON `teacher_class_logs` (`organizationId`,`classId`,`date`,`period`);