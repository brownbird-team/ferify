class UserError extends Error {
    constructor(message) {
        super(message);
        this.isUserError = true;
        this.userMessage = message;
    }
}
exports.UserError = UserError;

class SystemError extends Error {
    constructor(message) {
        super(message);
        this.isUserError = false;
        this.userMessage = 'Internal application error'; // TODO: zamijeni sa translationom is jsona
    }
}
exports.SystemError = SystemError;