//@ts-check
const {Client, GuildMember, Role  } = require('discord.js');
const {RoleUtils} = require('@discord-utils/roleUtils.js');
const {ServerUtils} = require('@discord-utils/serverUtils.js');
const { GuildService } = require('@root/services/GuildService');
const { UserService } = require('@root/services/UserService');
const container = require('@root/container');

class VerificationRoleUtils{
    /**@type {Client} */
    client;
    /**@type {RoleUtils} */
    roleUtils;
    /**@type {ServerUtils} */
    serverUtils;
    /**@type {GuildService} */
    guildService;
    /**@type {UserService} */
    userService;


    constructor(client, roleUtils, serverUtils){
        this.client = client;
        this.roleUtils = roleUtils;
        this.serverUtils = serverUtils;
        this.userService = container.resolve(UserService);
        this.guildService = container.resolve(GuildService)
    }
    /**
     * 
     * @param {string} serverId 
     * @param {string} verified 
     */
    async setRolesServer(serverId){

        const serverStatus = await this.guildService.getStatus(serverId)

        const server = await this.client.guilds.fetch(serverId);
        const members = await server.members.fetch();
        const verifiedRole = await server.roles.fetch(serverStatus.verifiedRoleId)
        const unverifiedRole = await server.roles.fetch(serverStatus.unverifiedRoleId)
        
        members.forEach(async member =>{
            const status = (await this.userService.getStatus(member.id)).verified;

            await this.setRole(member, status, verifiedRole, unverifiedRole);
        })
    }
    /**@param {string} userId */    
    async setRolesUser(userId){
        const serverIds = await this.guildService.getWhitelisted();
        const status = (await this.userService.getStatus(userId)).verified;
            serverIds.forEach(async serverId =>{
                try{
                const server = await this.client.guilds.fetch(serverId);
                const member = await server.members.fetch(userId);
                const serverStatus = await this.guildService.getStatus(serverId);
                const verifiedRole = await server.roles.fetch(serverStatus.verifiedRoleId);
                const unverifiedRole = await server.roles.fetch(serverStatus.unverifiedRoleId);
                
                await this.setRole(member, status, verifiedRole, unverifiedRole);
            }catch{}   
            })
    }
    /**
     * 
     * @param {string} userId 
     * @param {string} serverId 
     */
    async setRoleSpecific(userId, serverId){
        const serverStatus = await this.guildService.getStatus(serverId);
        const server  = await this.client.guilds.fetch(serverId);
        const member = await server.members.fetch(userId);
        const verifiedRole = await server.roles.fetch(serverStatus.verifiedRoleId);
        const unverifiedRole = await server.roles.fetch(serverStatus.unverifiedRoleId);
        const status = (await this.userService.getStatus(userId)).verified;
        await this.setRole(member, status, verifiedRole, unverifiedRole);
    }
    /**
     * 
     * @param {GuildMember } member
     * @param {boolean} status 
     * @param {Role} verifiedRole 
     * @param {Role} unverifiedRole 
     */
    async setRole(member, status, verifiedRole,unverifiedRole){
        if(status === true){
            try{await member.roles.add(verifiedRole)}catch{};
            try{await member.roles.remove(unverifiedRole)}catch{};        
        }
        else if(status === false){
            try{await member.roles.add(unverifiedRole)}catch{};
            try{await member.roles.remove(verifiedRole)}catch{};        
        }
    }

}
exports.VerificationRoleUtils = VerificationRoleUtils