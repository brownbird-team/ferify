// @ts-check

const { eq } = require('drizzle-orm');
const { DatabaseContext } = require('../contexts/DatabaseContext.js');

/**
 * @typedef {object} GuildStatus
 * 
 * @property {string} guildId
 * @property {boolean} whitelisted
 * @property {string | null} verifiedRoleId
 * @property {string | null} unverifiedRoleId
 */

class GuildService {

    /** @private @type {DatabaseContext} */
    dbctx;
    
    /**
     * @param {DatabaseContext} databaseContext
     */
    constructor(databaseContext) {
        this.dbctx = databaseContext;
    }

    /**
     * Fetch server status (information)
     * 
     * @param {string} guildId
     * @returns {Promise<GuildStatus>}
     */
    async getStatus(guildId) {

        /** @type {GuildStatus} */
        const status = {
            guildId: guildId,
            whitelisted: false,
            verifiedRoleId: null,
            unverifiedRoleId: null,
        };

        const { db } = this.dbctx;
        const { guilds } = this.dbctx.schema;

        const res = await db.select()
            .from(guilds)
            .where(eq(guilds.id, guildId))
            .limit(1);

        status.whitelisted = res.length > 0 && res[0].whitelisted;

        if (res.length == 0)
            return status;

        status.verifiedRoleId = res[0].verifiedRoleId;
        status.unverifiedRoleId = res[0].unverifiedRoleId;

        return status;
    }

    /**
     * Set verified role for the server
     * 
     * @param {string} guildId
     * @param {string | null} roleId
     */
    async setVerifiedRole(guildId, roleId) {
        await this.dbctx.db.insert(this.dbctx.schema.guilds)
            .values({
                id: guildId,
                verifiedRoleId: roleId,
            })
            .onDuplicateKeyUpdate({
                set: {
                    verifiedRoleId: roleId,
                }
            });
    }

    /**
     * Set unverified role for the server
     * 
     * @param {string} guildId
     * @param {string | null} roleId
     */
    async setUnverifiedRole(guildId, roleId) {
        await this.dbctx.db.insert(this.dbctx.schema.guilds)
            .values({
                id: guildId,
                unverifiedRoleId: roleId,
            })
            .onDuplicateKeyUpdate({
                set: {
                    unverifiedRoleId: roleId,
                }
            });
    }

    /**
     * Add/remove server from whitelist
     * 
     * @param {string} guildId
     * @param {boolean} [whitelisted = true]
     */
    async setWhitelisted(guildId, whitelisted = true) {
        console.log('WL', whitelisted);
        await this.dbctx.db.insert(this.dbctx.schema.guilds)
            .values({
                id: guildId,
                whitelisted: whitelisted,
            })
            .onDuplicateKeyUpdate({
                set: {
                    whitelisted: whitelisted,
                }
            });
    }
}

exports.GuildService = GuildService;