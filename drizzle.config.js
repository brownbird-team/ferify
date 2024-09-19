const container = require('./container.js');
const { ConfigContext } = require('./contexts/ConfigContext.js');

const cfg = container.resolve(ConfigContext).config;

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