
class InputUtils{
    /**
     * @param {string} snowflake 
     * @returns {boolean}
     */
    static async checkSnowflake(snowflake){
        const snowflakeRegex = /^\d{17,19}$/;
        return snowflakeRegex.test(snowflake)
    }
}

exports.InputUtils = InputUtils