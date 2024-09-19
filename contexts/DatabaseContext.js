// @ts-check

const mysql = require('mysql2');
const schema = require('./../database/schema.js');
const { drizzle } = require('drizzle-orm/mysql2');

const { ConfigContext } = require('./ConfigContext.js');

/** @typedef {import('./ConfigContext.js').Config} Config */

class DatabaseContext {
    
    /** @type {Config} */
    config;
    /** @type {typeof schema} */
    schema;
    /** @type {import('drizzle-orm/mysql2').MySql2Database} */
    db;

    /**
     * @param {ConfigContext} configContext
     */
    constructor(configContext) {
        const cfg = configContext.config;

        const pool = mysql.createPool({
            host: cfg.databaseHost,
            port: cfg.databasePort,
            user: cfg.databaseUsername,
            password: cfg.databasePassword,
            database: cfg.databaseName,
        });

        this.db = drizzle(pool);
        this.schema = schema;
        this.config = cfg;
    }
}

exports.DatabaseContext = DatabaseContext;