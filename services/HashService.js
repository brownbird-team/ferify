// @ts-check

const HASH_ALHORITHM = 'sha512';
const HASH_ITERATIONS = 100;

const { createHash } = require('node:crypto');
const { ConfigContext } = require('../contexts/ConfigContext.js');

/** @typedef {import('../contexts/ConfigContext.js').Config} Config */

class HashService {

    /** @private @type {Config} */
    config;

    /**
     * @param {ConfigContext} configContext
     */
    constructor(configContext) {
        this.config = configContext.config;
    }

    /**
     * Hash user email to be stored in the DB
     * 
     * @param {string} email 
     */
    hashEmail(email) {
        const hash = createHash(HASH_ALHORITHM);

        hash.update(this.config.hashPepper + email);
        return hash.digest('base64');
    }
}

exports.HashService = HashService;