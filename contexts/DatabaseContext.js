// @ts-check

const mysql = require('mysql2');
const schema = require('./../database/schema.js');
const { drizzle } = require('drizzle-orm/mysql2');

const { ConfigContext } = require('./ConfigContext.js');

/** @typedef {import('./ConfigContext.js').Config} Config */

class DatabaseContext {
    /** @type { DatabaseContext | null } */
    static instance = null;

    /** @type {Config} */
    config;
    /** @type {typeof schema} */
    schema;
    /** @type {import('drizzle-orm/mysql2').MySql2Database} */
    db;

    /**
     * Return DatabaseContext global instance
     * @returns {DatabaseContext}
     */
    static getInstance() {
        if (DatabaseContext.instance)
            return DatabaseContext.instance;

        const config = ConfigContext.getConfig();

        DatabaseContext.instance = new DatabaseContext(config);
        return DatabaseContext.instance;
    }

    /**
     * @param {Config} config
     */
    constructor(config) {
        const pool = mysql.createPool({
            host: config.databaseHost,
            port: config.databasePort,
            user: config.databaseUsername,
            password: config.databasePassword,
            database: config.databaseName,
        });

        this.db = drizzle(pool);
        this.schema = schema;
    }
}

exports.DatabaseContext = DatabaseContext;