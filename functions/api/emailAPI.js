"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const nodemailer = require('nodemailer');
// Set variable for this project
// firebase functions:config:set gmail.email="myusername@gmail.com" gmail.password="secretpassword"
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: gmailEmail,
        pass: gmailPassword
    }
};
var mailTransport = nodemailer.createTransport(smtpConfig);
//
// const mailTransport = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: gmailEmail,
//     pass: gmailPassword
//   }
// })
/**
 * Send email
 */
const sendEmail = (email) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: email.from,
            to: email.to,
            subject: email.subject,
            html: email.html
        };
        mailTransport.sendMail(mailOptions)
            .then(() => {
            console.log(`New subscription confirmation email sent to: ${email.to}`);
            resolve();
        })
            .catch((error) => {
            console.error('There was an error while sending the email:', error);
            console.error(`There was an error sending the email from: ${gmailEmail} pass: ${gmailPassword} + ERROR: ${error}`);
            reject(error);
        });
    });
};
exports.emailAPI = {
    sendEmail
};
//# sourceMappingURL=emailAPI.js.map