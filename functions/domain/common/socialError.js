"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SocialError extends Error {
    constructor(_code, _message) {
        super(_message);
        this._code = _code;
        this._message = _message;
        this._isError = true;
    }
    /**
     * Error code
     *
     * @type {string}
     * @memberof SocialError
     */
    get code() {
        return this._code;
    }
    /**
     * Error message
     *
     * @type {string}
     * @memberof SocialError
     */
    get message() {
        return this._message;
    }
    /**
     * If is error {true} if not {false}
     *
     * @type {Boolean}
     * @memberof SocialError
     */
    get isError() {
        return this._isError;
    }
}
exports.SocialError = SocialError;
//# sourceMappingURL=socialError.js.map