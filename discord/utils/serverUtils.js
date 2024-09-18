const {Client} = require('discord.js')
class ServerUtils{
    /**
     * Return if server is setup correctly for bot to work
     * @param {import("@root/services/GuildService").GuildStatus} guildStatus
     * @param {Client} client 
     * @returns {boolean}
     */
    static async checkServerStatus(guildStatus, client){
        const verifiedRoleStatus = await this.checkRoleStatus(
                                guildStatus.verifiedRoleId,
                                guildStatus.guildId,
                                client
        )
        const unverifiedRoleStatus = await this.checkRoleStatus(
                                guildStatus.unverifiedRoleId,
                                guildStatus.guildId,
                                client
        );
        

    }
    /**
     * 
     * @param {string} roleId 
     * @param {string} serverId
     * @param {Client} client 
     * @returns {boolean | null}
     */
    static async checkRoleStatus(roleId, serverId, client){
        const guild = await client.guilds.fetch(serverId)
        const role = await guild.roles.fetch(roleId)

        return "editable" in role ? role.editable : null
    }
}

exports.ServerUtils = ServerUtils