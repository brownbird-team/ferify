const { ConfigContext } = require('./contexts/ConfigContext.js');

const cfg = ConfigContext.getConfig();

/** @type { import('drizzle-kit').Config } */
exports.default = {
    dialect: 'mysql',
    schema: './database/schema.js',
    out: './database/migrations',
    migrations: {
        table: 'migrations',
    },
    dbCredentials: {
        host: cfg.databaseHost,
        port: cfg.databasePort,
        user: cfg.databaseUsername,
        password: cfg.databasePassword,
        database: cfg.databaseName,
    },
};