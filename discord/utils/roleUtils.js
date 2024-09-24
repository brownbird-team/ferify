
const {Client, roleMention} = require('discord.js')
const {StatusEnum} = require("@discord-utils/enums.js")

class RoleUtils{
    /**
     * @type {Client} 
     */
    client;

    /**
     * @param {Client} client 
     */
    constructor(client){
        this.client = client;
    }
    
    /**
     * 
     * @param {string} roleId 
     * @param {string} serverId
     * @returns {Promise<number>}
     */
    async checkRoleStatus(roleId, serverId){
        const guild = await this.client.guilds.fetch(serverId)
        const role = await guild.roles.fetch(roleId)
        if (!role || !("editable" in role)) 
            return StatusEnum.neutral;
        
        if (role.editable) 
            return StatusEnum.good;
        
        return StatusEnum.bad;
        
    }
    /**
     * @param {string} serverId
     * @param {string} roleId 
     */
    async getRoleName(roleId, serverId){
        const server  = await this.client.guilds.fetch(serverId);
        const role = await server.roles.fetch(roleId);
        return role.name
    }
    /**
     * @param {string} serverId
     * @param {string} roleId 
     */
    async mentionRole(roleId, serverId){
        if(roleMention(roleId) === "<@&null>") return "not set"
        return roleMention(roleId)
    }
    /**
     * 
     * @param {number} a 
     * @param {number} b 
     * @returns {Promise<number>}
     */
    async generateConfigStatus(a ,b, whitelist){
        if(!whitelist) return 0

        if (a === 1) return (b === 1 || b === 0) ? 1 : 0;
        if (a === 0) return (b === 1) ? 1 : -1;
        if (a === -1) return (b === 1) ? 0 : -1;

        return "Gorim"
    }

}

exports.RoleUtils = RoleUtils