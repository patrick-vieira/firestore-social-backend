"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
class Profile extends common_1.BaseDomain {
    constructor(avatar, fullName, banner, tagLine, creationDate, email) {
        super();
        this.avatar = avatar;
        this.fullName = fullName;
        this.banner = banner;
        this.tagLine = tagLine;
        this.creationDate = creationDate;
        this.email = email;
    }
}
exports.Profile = Profile;
//# sourceMappingURL=profile.js.map