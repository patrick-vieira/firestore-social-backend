"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const emailAPI_1 = require("../../api/emailAPI");
const email_1 = require("../../domain/common/email");
const gmailEmail = functions.config().gmail.email;
const appName = functions.config().setting.appname;
exports.onCreateFeedback = functions.firestore
    .document(`feeds/{feedId}`)
    .onCreate((dataSnapshot, context) => {
    return new Promise((resolve, reject) => {
        const feed = dataSnapshot.data();
        const from = `${appName} Feedback <${gmailEmail}>`;
        const to = 'pdsv88@gmail.com';
        const subject = `${feed.feedType} -${feed.user.email} - ${dataSnapshot.createTime}`;
        const text = `
    Feedback type: ${feed.feedType}
    Feedback ID: ${feed.id}
  
    User Email: ${feed.user.email}
    User Fullname: ${feed.user.fullName}
    User ID: ${feed.user.userId}
  
    Feedback: ${feed.text}
    `;
        /**
         * Send email
         */
        emailAPI_1.emailAPI.sendEmail(new email_1.Email(from, to, subject, text)).then(() => {
            resolve();
        }).catch((error) => {
            reject();
        });
    });
});
//# sourceMappingURL=mailService.js.map