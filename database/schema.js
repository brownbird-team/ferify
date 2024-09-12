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
    allowed: boolean('allowed'),
});
exports.guilds = guilds;

const guildRoles = mysqlTable('guild_roles', {
    roleId: varchar('role_id', 18).primaryKey(),
    guildId: varchar('guild_id', 18).references(() => guilds.id),
    type: mysqlEnum('type', [ 'verified', 'unverified' ]),
});
exports.guildRoles = guildRoles;