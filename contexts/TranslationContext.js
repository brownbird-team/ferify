// @ts-check

const fs = require('fs');
const path = require('path');

const { ConfigContext } = require('./ConfigContext.js')

/** @typedef {import('./ConfigContext.js').Config} Config */

/**
 * Function type returned by TranslationContext and used
 * to fetch translations
 * 
 * @callback Translator
 * @param {string} key
 * @param {Object<string, string>} [properties]
 * @returns {string}
 */ 

class TranslationContext {
    /** @type {TranslationContext | null} */
    static instance = null;

    /** @type {Config} */
    config;

    /**
     * Return TranslationContext global instanc
     * @returns {TranslationContext}
     */
    static getInstance() {
        if (TranslationContext.instance)
            return TranslationContext.instance;

        const config = ConfigContext.getConfig();

        TranslationContext.instance = new TranslationContext(config);
        return TranslationContext.instance;
    }

    /**
     * @param {Config} config
     */
    constructor(config) {
        this.config = config;

        const translationObjects = new Map();
        const languageDir = path.resolve(__dirname + '/../lang/');
        const languageFiles = fs.readdirSync(languageDir).filter(f => f.endsWith('.json'));

        languageFiles.forEach(filename => {
            const lang = filename.slice(0, filename.length - '.json'.length);

            translationObjects.set(lang, require(languageDir + '/' + filename));
        });

        const translations = new Map();

        translationObjects.forEach((value, key) => {
            const map = new Map();

            const iterate = (parentPath, obj) => {
                Object.entries(obj).forEach(([ key, value ]) => {
                    const itemPath = parentPath.length > 0 ? parentPath + '.' + key : key;

                    // If value is a string add it to the map
                    if (typeof value == 'string')
                        map.set(itemPath, value);

                    // If value is an object go deeper into object
                    if (typeof value == 'object')
                        iterate(itemPath, value);

                    // If value is array get all strings from array and join them
                    if (Array.isArray(value))
                        map.set(itemPath, value.filter(chunk => typeof chunk == 'string').join(''));
                });
            }

            iterate('', value);
            translations.set(key, map);
        });

        this.translations = translations;
    }

    /**
     * Get translator function for given language
     * 
     * @param {string} language 
     * @returns {Translator}
     */
    getTranslator(language) {
        if (!this.translations.has(language))
            throw Error(`Translation for language "${language}" not found`);

        return (key, properties) => {
            const lang = this.translations.get(language);

            if (!lang.has(key))
                throw Error(`Translation key "${key}" not found for language "${language}"`);

            let result = lang.get(key);

            if (properties) {
                Object.entries(properties).forEach(([ key, value ]) => {
                    result = result.replaceAll(`{{${key}}}`, value);
                });
            }

            if (/\{\{[a-zA-z]+\}\}/.test(result))
                console.warn(`Insufficient properties provided for "${key}" translation key in "${language}" language:\n  => ${result}`);
            
            return result;
        }
    }

    /**
     * Check if given language translation exists
     * 
     * @param {string} language 
     * @returns {boolean}
     */
    translationExists(language) {
        return this.translations.has(language);
    }

    /**
     * Get translator function for language configured in app config
     * 
     * @returns {Translator}
     */
    getGlobalTranslator() {
        const lang = this.translationExists(this.config.language) ? this.config.language : 'en';

        if (!this.translationExists(this.config.language))
            console.warn(`There is no translation for language "${this.config.language}" specified in the config file, falling back to "en"`);

        return this.getTranslator(lang);
    }
}

exports.TranslationContext = TranslationContext;

/**
 * USAGE:
 * 
 * const tctx = TranslationContext.getInstance();
 * const t = tctx.getGlobalTranslator();
 * 
 * console.log(t('verifyEmail', { emailAddress: 'r@r.com' }))
 */