const { ConfigContext } = require('../contexts/ConfigContext.js')

class MailListenerService {

    /**
     * @param {ConfigContext} configCtx 
     */
    constructor(configCtx, translationCtx) {
        this.config = configCtx;
        this.translation = translationCtx;
    }

    /**
     * Start message listener
     */
    async startListener() {

    }
}

exports.MailListenerService = MailListenerService;