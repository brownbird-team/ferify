const { varchar, mysqlTable, boolean, datetime, mysqlEnum } = require('drizzle-orm/mysql-core');

const users = mysqlTable('users', {
    id: varchar('user_id', 18).primaryKey(),
    emailHash: varchar('email_hash', 2048),
    locked: boolean('locked'),
    verified: boolean('verified'),
    code: varchar('code', 512),
    codeCreated: datetime('code_created'),
});
exports.users = users;

const blacklist = mysqlTable('blacklist', {
    emailHash: varchar('email_hash', 2048).primaryKey(),
    blacklisted: boolean('blacklisted'),
});
exports.blacklist = blacklist;

const guilds = mysqlTable('guilds', {
    id: varchar('guild_id', 18).primaryKey(),
    whitelisted: boolean('whitelisted').default(false),
    verifiedRoleId: varchar('verified_role_id', 18),
    unverifiedRoleId: varchar('unverified_role_id', 18),
});
exports.guilds = guilds;