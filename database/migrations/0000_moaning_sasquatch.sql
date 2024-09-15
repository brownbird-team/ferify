CREATE TABLE `users` (
	`user_id` varchar(20) NOT NULL,
	`email_hash` varchar(2048) NOT NULL,
	`locked` boolean NOT NULL DEFAULT false,
	`verified` boolean NOT NULL DEFAULT false,
	`code` varchar(2048),
	`code_created` datetime,
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`),
	CONSTRAINT `users_email_hash_unique` UNIQUE(`email_hash`)
);
--> statement-breakpoint
CREATE TABLE `blacklist` (
	`id` bigint unsigned NOT NULL,
	`email_hash` varchar(2048) NOT NULL,
	`locked` boolean NOT NULL DEFAULT false,
	`blacklisted` boolean NOT NULL DEFAULT true,
	CONSTRAINT `blacklist_id` PRIMARY KEY(`id`),
	CONSTRAINT `blacklist_email_hash_unique` UNIQUE(`email_hash`)
);
--> statement-breakpoint
CREATE TABLE `guilds` (
	`guild_id` varchar(20) NOT NULL,
	`whitelisted` boolean NOT NULL DEFAULT false,
	`verified_role_id` varchar(20),
	`unverified_role_id` varchar(20),
	CONSTRAINT `guilds_guild_id` PRIMARY KEY(`guild_id`)
);
