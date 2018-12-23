"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * User provide data
 *
 * @export
 * @class UserProvider
 */
class UserProvider {
    constructor(userId, email, fullName, avatar, providerId, provider, accessToken) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.avatar = avatar;
        this.providerId = providerId;
        this.provider = provider;
        this.accessToken = accessToken;
    }
}
exports.UserProvider = UserProvider;
//# sourceMappingURL=userProvider.js.map