const { defineConfig } = require('drizzle-kit');
const { ConfigContext } = require('./contexts/ConfigContext.js');

const cfg = ConfigContext.getInstance();

exports.default = defineConfig({
    dialect: 'mysql',
    schema: './database/schema.js',
    out: './database/migrations',
    migrations: {
        table: '_migrations',
    },
    dbCredentials: {
        host: cfg.databaseHost,
        port: cfg.databasePort,
        user: cfg.databaseUsername,
        password: cfg.databasePassword,
        database: cfg.databaseName,
    },
});