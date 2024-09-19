ALTER TABLE `users` DROP INDEX `users_email_hash_unique`;--> statement-breakpoint
ALTER TABLE `blacklist` MODIFY COLUMN `id` bigint unsigned AUTO_INCREMENT NOT NULL;