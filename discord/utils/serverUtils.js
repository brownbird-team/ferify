//@ts-check
const {Client} = require('discord.js')
const {StatusEnum, StatusEnum2Emoji} = require('@discord-utils/enums.js');
const { RoleUtils } = require('@discord-utils/roleUtils');

class ServerUtils{
    /**@type {Client}*/
    client;
    /**@type {RoleUtils}*/
    roleUtils;
    
    /**
     * @param {Client} client 
     * @param {RoleUtils} roleUtils
     */
    constructor(client, roleUtils){
        this.client = client;
        this.roleUtils = roleUtils;
    } 
    /**
     * Return if server is setup correctly for bot to work
     * @param {import("@root/services/GuildService").GuildStatus} guildStatus
     * @returns {Promise<number>}
     */
    async checkConfigStatus(guildStatus){
        if(!guildStatus.whitelisted) return StatusEnum.bad

        const verifiedRoleStatus = await this.roleUtils.checkRoleStatus(
                                guildStatus.verifiedRoleId,
                                guildStatus.guildId
        );

        const unverifiedRoleStatus = await this.roleUtils.checkRoleStatus(
            guildStatus.unverifiedRoleId,
            guildStatus.guildId
        );
        return await this.roleUtils.generateConfigStatus(verifiedRoleStatus, unverifiedRoleStatus, guildStatus.whitelisted)
    }
    
    
    /**
     * 
     * @param {import("@root/services/GuildService").GuildStatus} guildStatus
     * @returns 
     */
    async generateServerStatus(guildStatus){
        
        return {
            serverName : await this.getServerName(guildStatus.guildId),
            whitelistStatus : await StatusEnum2Emoji(guildStatus.whitelisted),
            verifiedRole: await this.roleUtils.mentionRole(guildStatus.verifiedRoleId,guildStatus.guildId),
            unverifiedRole: await this.roleUtils.mentionRole(guildStatus.unverifiedRoleId,guildStatus.guildId),
            verifiedRoleStatus: await StatusEnum2Emoji(await this.roleUtils.checkRoleStatus(guildStatus.verifiedRoleId,guildStatus.guildId)),
            unverifiedRoleStatus: await StatusEnum2Emoji(await this.roleUtils.checkRoleStatus(guildStatus.unverifiedRoleId,guildStatus.guildId)),
            configStatus: await this.checkConfigStatus(guildStatus)
        }
    }
    /**
     * 
     * @param {string} server_id
     * @returns {Promise<string>} 
     */
    async getServerName(server_id){
        return (await this.client.guilds.fetch(server_id)).name
    }
    
}

exports.ServerUtils = ServerUtils