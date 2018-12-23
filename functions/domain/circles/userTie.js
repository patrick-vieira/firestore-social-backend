"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseDomain_1 = require("../common/baseDomain");
class UserTie extends baseDomain_1.BaseDomain {
    constructor(
    /**
     * User identifier
     *
     * @type {string}
     * @memberof UserTie
     */
    userId, 
    /**
     * Circle creation date time
     *
     * @type {Date}
     * @memberof Circle
     */
    creationDate, 
    /**
     * User full name
     *
     * @type {string}
     * @memberof UserTie
     */
    fullName, 
    /**
     * Avatar URL address
     *
     * @type {string}
     * @memberof UserTie
     */
    avatar, 
    /**
     * If following user approved {true} or not {false}
     *
     * @type {Boolean}
     * @memberof UserTie
     */
    approved) {
        super();
        this.userId = userId;
        this.creationDate = creationDate;
        this.fullName = fullName;
        this.avatar = avatar;
        this.approved = approved;
    }
}
exports.UserTie = UserTie;
//# sourceMappingURL=userTie.js.map