const mysql = require('mysql2');
const schema = require('./../database/schema.js');
const { drizzle } = require('drizzle-orm/mysql2');

const { ConfigContext } = require('./ConfigContext.js');

class DatabaseContext {
    static instance = null;

    /**
     * Return DatabaseContext global instance
     * @returns {DatabaseContext}
     */
    static getInstance() {
        if (DatabaseContext.instance)
            return DatabaseContext.instance;

        const config = ConfigContext.getInstance();

        DatabaseContext.instance = new DatabaseContext(config);
        return DatabaseContext.instance;
    }

    /**
     * @param {ConfigContext} configCtx
     */
    constructor(configCtx) {
        const pool = mysql.createPool({
            host: configCtx.databaseHost,
            port: configCtx.databasePort,
            user: configCtx.databaseUsername,
            password: configCtx.databasePassword,
            database: configCtx.databaseName,
        });

        this.db = drizzle(pool);
        this.schema = schema;
    }
}

exports.DatabaseContext = DatabaseContext;