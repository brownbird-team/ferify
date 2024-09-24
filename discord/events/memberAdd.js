const { Events} = require('discord.js');
const { RoleUtils } = require('../utils/roleUtils');
const { ServerUtils } = require('../utils/serverUtils');
const { VerificationRoleUtils } = require('../utils/verificationRoleUtils');


module.exports = {
    name : Events.GuildMemberAdd,
    async execute(member) {
        const roleUtils = new RoleUtils(member.client);
        const serverUtils = new ServerUtils(member.client, roleUtils);
        const verificationRoleUtils = new VerificationRoleUtils(member.client,roleUtils,serverUtils);
        await verificationRoleUtils.setRoleSpecific(member.id, member.guild.id)
        console.log(member.guild.id)
        console.log(member.id)
        
    }
}