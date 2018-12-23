"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Verification {
    constructor(id, code, target, creationDate, remoteIpAddress, userId, isVerified = false) {
        this.id = id;
        this.code = code;
        this.target = target;
        this.creationDate = creationDate;
        this.remoteIpAddress = remoteIpAddress;
        this.userId = userId;
        this.isVerified = isVerified;
    }
}
exports.Verification = Verification;
//# sourceMappingURL=Verification.js.map