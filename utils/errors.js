class UserError extends Error {
    constructor(message) {
        super(message);
        this.isUserError = true;
    }
}
exports.UserError = UserError;