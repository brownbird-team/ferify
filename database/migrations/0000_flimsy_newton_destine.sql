CREATE TABLE `users` (
	`user_id` varchar NOT NULL,
	`email_hash` varchar,
	`locked` boolean,
	`verified` boolean,
	`code` varchar,
	`code_created` datetime,
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `blacklist` (
	`email_hash` varchar NOT NULL,
	`blacklisted` boolean,
	CONSTRAINT `blacklist_email_hash` PRIMARY KEY(`email_hash`)
);
--> statement-breakpoint
CREATE TABLE `guilds` (
	`guild_id` varchar NOT NULL,
	`allowed` boolean,
	CONSTRAINT `guilds_guild_id` PRIMARY KEY(`guild_id`)
);
--> statement-breakpoint
CREATE TABLE `guild_roles` (
	`role_id` varchar NOT NULL,
	`guild_id` varchar,
	`type` enum('verified','unverified'),
	CONSTRAINT `guild_roles_role_id` PRIMARY KEY(`role_id`)
);
--> statement-breakpoint
ALTER TABLE `guild_roles` ADD CONSTRAINT `guild_roles_guild_id_guilds_guild_id_fk` FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON DELETE no action ON UPDATE no action;