const { TranslationContext } = require('../contexts/TranslationContext.js');

/**
 * Converts UserError or any other error object
 * to something that can be displayed to the user
 * 
 * @param {*} err
 * @returns {string}
 */
exports.toUserError = (err) => {

    if (err && err.isUserError)
        return err.message;

    const t = TranslationContext.getInstance().getGlobalTranslator();
    console.error(err);

    return t('errors.internalError');
}