// @ts-check

const path = require('node:path');

const { sql, eq } = require('drizzle-orm');
const { migrate } = require('drizzle-orm/mysql2/migrator');
const { DatabaseContext } = require('../../contexts/DatabaseContext.js');
const { TestConfigContext } = require('./TestConfigContext.js');

class TestDatabaseContext extends DatabaseContext {

    /**
     * @param {TestConfigContext} testConfig 
     */
    constructor(testConfig) {
        // @ts-expect-error
        super(testConfig);
    }

    async dropAllTables() {
        await this.db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

        const res = await this.db.select({ table_name: sql`table_name` })
            .from(sql`information_schema.tables`)
            .where(eq(sql`table_schema`, this.config.databaseName));

        for (const { table_name } of res) {
            await this.db.execute(sql.raw(`DROP TABLE IF EXISTS ${table_name}`));
        }
    }

    async clearAllTables() {
        for (const table of Object.values(this.schema)) {
            await this.db.delete(table);
        }
    }

    async migrate() {
        await migrate(this.db, { 
            migrationsFolder: path.resolve(__dirname, '../../database/migrations'),
            migrationsTable: 'migrations',
        });
    }
}

exports.TestDatabaseContext = TestDatabaseContext;