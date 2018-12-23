"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
class RegisterUserResult extends common_1.BaseDomain {
    constructor(uid) {
        super();
        this._uid = uid;
    }
    /**
     * User identifier
     */
    get uid() {
        return this._uid;
    }
}
exports.RegisterUserResult = RegisterUserResult;
//# sourceMappingURL=registerUserResult.js.map