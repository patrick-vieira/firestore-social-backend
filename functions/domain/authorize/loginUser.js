"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
class LoginUser extends common_1.BaseDomain {
    constructor(_uid, _emailVerified, _providerId = '', _displayName = '', _email = '', _avatarURL = '') {
        super();
        this._uid = _uid;
        this._emailVerified = _emailVerified;
        this._providerId = _providerId;
        this._displayName = _displayName;
        this._email = _email;
        this._avatarURL = _avatarURL;
    }
    /**
     * User identifier
     */
    get uid() {
        return this._uid;
    }
    /**
     * If user's email is verifide {true} or not {false}
     */
    get emailVerified() {
        return this._emailVerified;
    }
    get providerId() {
        return this._providerId;
    }
    get displayName() {
        return this._displayName;
    }
    get email() {
        return this.email;
    }
    get avatarURL() {
        return this._avatarURL;
    }
}
exports.LoginUser = LoginUser;
//# sourceMappingURL=loginUser.js.map