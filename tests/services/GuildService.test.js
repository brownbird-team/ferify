// @ts-check

import { GuildService } from '../../services/GuildService.js';
import { TestConfigContext } from '../contexts/TestConfigContext.js';
import { TestDatabaseContext } from '../contexts/TestDatabaseContext.js';
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';

describe('Testing GuildService', () => {
    /** @type {TestDatabaseContext} */
    let databaseCtx;

    beforeAll(async () => {
        const configCtx = new TestConfigContext();
        databaseCtx = new TestDatabaseContext(configCtx);

        await databaseCtx.dropAllTables();
        await databaseCtx.migrate();
    });

    beforeEach(async () => {
        await databaseCtx.clearAllTables();
    })

    it('getStatus', async () => {
        const guildServ = new GuildService(databaseCtx);

        const cases = [
            {
                record: { id: 'g1',      unverifiedRoleId: null, verifiedRoleId: null, whitelisted: false },
                status: { guildId: 'g1', unverifiedRoleId: null, verifiedRoleId: null, whitelisted: false },
            },{
                record: { id: 'g2',      unverifiedRoleId: 'r1', verifiedRoleId: null, whitelisted: true  },
                status: { guildId: 'g2', unverifiedRoleId: 'r1', verifiedRoleId: null, whitelisted: true  },
            },{
                record: { id: 'g3',      unverifiedRoleId: null, verifiedRoleId: 'r2', whitelisted: true  },
                status: { guildId: 'g3', unverifiedRoleId: null, verifiedRoleId: 'r2', whitelisted: true  },
            },{
                record: { id: 'g4',      unverifiedRoleId: 'r4', verifiedRoleId: 'r3', whitelisted: true  },
                status: { guildId: 'g4', unverifiedRoleId: 'r4', verifiedRoleId: 'r3', whitelisted: true  },
            },{
                record: { id: 'g5',      unverifiedRoleId: 'r4', verifiedRoleId: 'r3', whitelisted: false },
                status: { guildId: 'g5', unverifiedRoleId: 'r4', verifiedRoleId: 'r3', whitelisted: false },
            },
        ]

        // For each test case check if retrived as it should be
        await databaseCtx.db.insert(databaseCtx.schema.guilds)
            .values(cases.map(c => c.record));

        for (const { record, status } of cases) {
            const stat = await guildServ.getStatus(record.id);
            expect(stat).to.deep.equal(status);
        }

        // Check what happens if record is not in the DB
        const stat = await guildServ.getStatus('not_in_the_db');
        expect(stat).to.deep.equal({
            guildId: 'not_in_the_db',
            verifiedRoleId: null,
            unverifiedRoleId: null,
            whitelisted: false,
        })
    });

    it('setWhitelisted', async () => {
        let status;
        const id = 'g1';
        const servGuild = new GuildService(databaseCtx);

        // Check if able to add to whitelist
        await servGuild.setWhitelisted(id, true);
        status = (await servGuild.getStatus(id)).whitelisted;
        expect(status).to.equal(true);

        // Check if able to remove from whitelist
        await servGuild.setWhitelisted(id, false);
        status = (await servGuild.getStatus(id)).whitelisted;
        expect(status).to.equal(false);
    });

    it('setVerifiedRole', async () => {
        let status;
        const id = 'g1';
        const servGuild = new GuildService(databaseCtx);

        // Check if able to set role
        await servGuild.setVerifiedRole(id, 'r1');
        status = (await servGuild.getStatus(id)).verifiedRoleId;
        expect(status).to.equal('r1');

        // Check if able to unset role
        await servGuild.setVerifiedRole(id, null);
        status = (await servGuild.getStatus(id)).verifiedRoleId;
        expect(status).to.equal(null);
    });

    it('setUnverifiedRole', async () => {
        let status;
        const id = 'g1';
        const servGuild = new GuildService(databaseCtx);

        // Check if able to set role
        await servGuild.setUnverifiedRole(id, 'r1');
        status = (await servGuild.getStatus(id)).unverifiedRoleId;
        expect(status).to.equal('r1');

        // Check if able to unset role
        await servGuild.setUnverifiedRole(id, null);
        status = (await servGuild.getStatus(id)).unverifiedRoleId;
        expect(status).to.equal(null);
    });
});

