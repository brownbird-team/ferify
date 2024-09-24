const container = require('@root/container.js')
const { ConfigContext } = require('@root/contexts/ConfigContext')
const cfg = container.resolve(ConfigContext).config

const StatusEnum = {
    good : 1,
    neutral : 0,
    bad : -1,
}

const StatusEnum2Emoji = async (status) =>{
    let color;

    if(status === true) color = "green";
    if(status === false) color = "red";

    switch (status){
        case 1:
            color = "green";
            break;
        case 0:
            color = "yellow";
            break;
        case -1:
            color = "red";
            break;   
    }
    return `:${color}_square:`
}
const StatusEnum2Color = async (status) =>{
    let color;

    if(status === true) color = cfg.discordColors.success;
    if(status === false) color = cfg.discordColors.error;

    switch (status){
        case 1:
            color = cfg.discordColors.success;
            break;
        case 0:
            color = cfg.discordColors.neutral;
            break;
        case -1:
            color = cfg.discordColors.error;
            break;   
    }
    return color
}

exports.StatusEnum = StatusEnum 
exports.StatusEnum2Emoji = StatusEnum2Emoji
exports.StatusEnum2Color = StatusEnum2Color