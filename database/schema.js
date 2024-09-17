// @ts-check

const { UserSelectMenuBuilder } = require('discord.js');
const { varchar, mysqlTable, boolean, datetime, bigint } = require('drizzle-orm/mysql-core');

const users = mysqlTable('users', {
    id: varchar('user_id', { length: 20 }).primaryKey(),
    emailHash: varchar('email_hash', { length: 2048 }).notNull().unique(),
    locked: boolean('locked').notNull().default(false),
    verified: boolean('verified').notNull().default(false),
    code: varchar('code', { length: 2048 }),
    codeCreated: datetime('code_created'),
});
exports.users = users;

/**
 * @typedef {typeof users.$inferSelect} UserRecord
 */

const blacklist = mysqlTable('blacklist', {
    id: bigint('id', { mode: 'bigint', unsigned: true }).primaryKey(),
    emailHash: varchar('email_hash', { length: 2048 }).notNull().unique(),
    permanent: boolean('locked').notNull().default(false),
    blacklisted: boolean('blacklisted').notNull().default(true),
});
exports.blacklist = blacklist;

/**
 * @typedef {typeof blacklist.$inferSelect} BlacklistRecord
 */

const guilds = mysqlTable('guilds', {
    id: varchar('guild_id', { length: 20 }).primaryKey(),
    whitelisted: boolean('whitelisted').notNull().default(false),
    verifiedRoleId: varchar('verified_role_id', { length: 20 }),
    unverifiedRoleId: varchar('unverified_role_id', { length: 20 }),
});
exports.guilds = guilds;

/**
 * @typedef {typeof guilds.$inferSelect} GuildRecord
 */