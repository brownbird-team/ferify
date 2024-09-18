// @ts-check

const HASH_ALHORITHM = 'sha512';
const HASH_ITERATIONS = 100;

const VERIFY_CODE_LEN = 6;

const { createHash } = require('node:crypto');
const { ConfigContext } = require('../contexts/ConfigContext.js');

/** @typedef {import('../contexts/ConfigContext.js').Config} Config */

class CryptoService {

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
     * @returns {string}
     */
    hashEmail(email) {
        let hashed = this.config.hashPepper + email;

        for (let i = 0; i < HASH_ITERATIONS; i++) {
            const hash = createHash(HASH_ALHORITHM);

            hash.update(hashed);
            hashed = hash.digest('base64');
        }

        return hashed;
    }

    /**
     * Generate new email verification code
     * 
     * @returns {string}
     */
    generateVerifyCode() {
        let code = '';

        while (code.length < VERIFY_CODE_LEN) {
            code += Math.random().toString(16).split('.')[1]
        }

        return code.slice(0, VERIFY_CODE_LEN).toUpperCase();
    }
}

exports.CryptoService = CryptoService;