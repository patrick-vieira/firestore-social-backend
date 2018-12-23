"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const index_1 = require("../../data/index");
const moment = require("moment");
const express = require("express");
const bodyParser = require("body-parser");
const index_2 = require("../../domain/common/index");
const Verification_1 = require("../../domain/authorize/Verification");
const emailAPI_1 = require("../../api/emailAPI");
const email_1 = require("../../domain/common/email");
const httpStatusCode_1 = require("../../data/httpStatusCode");
const bcrypt = require('bcrypt');
const request = require('request');
const cookieParser = require('cookie-parser')();
const app = express();
const cors = require('cors')({ origin: true });
app.disable('x-powered-by');
app.use(cors);
app.use(bodyParser.json());
app.use(cookieParser);
const gmailEmail = functions.config().gmail.email;
const appName = functions.config().setting.appname;
/**
 * Login user API
 */
app.post('/api/login', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const remoteIpAddress = req.connection.remoteAddress;
    const userName = req.body['userName'];
    const password = req.body['password'];
    console.log(userName, password);
    index_1.firestoreDB.collection('protectedUser').where('userName', '==', userName)
        .get().then((result) => {
        console.log('result', result.size, result.empty);
        if (result && !result.empty && result.size === 1) {
            const doc = result.docs[0];
            console.log(doc);
            const data = doc.data();
            console.log('data = ', data);
            bcrypt.compare(password, data.password, (error, isSame) => {
                if (isSame === true) {
                    const additionalClaims = {
                        phoneVerified: data.phoneVerified,
                        userName: data.userName
                    };
                    index_1.adminDB.auth().createCustomToken(doc.id, additionalClaims)
                        .then((token) => {
                        // Send token back to client
                        return res.status(httpStatusCode_1.HttpStatusCode.OK).json({ token });
                    })
                        .catch((error) => {
                        console.log('Error creating custom token:', error);
                        return res.status(httpStatusCode_1.HttpStatusCode.InternalServerError).send(new index_2.SocialError('ServerError/CreateToke', 'Error on creating token!'));
                    });
                }
                else {
                    return res.status(httpStatusCode_1.HttpStatusCode.InternalServerError).send(new index_2.SocialError('ServerError/WrongPassword', 'Password is wrong!'));
                }
            });
        }
        else {
            return res.status(httpStatusCode_1.HttpStatusCode.InternalServerError).send(new index_2.SocialError('ServerError/WrongUserName', 'User name is wrong!'));
        }
    })
        .catch((error) => {
        return res.status(httpStatusCode_1.HttpStatusCode.InternalServerError).send(new index_2.SocialError('ServerError/FirestoreGetData', error));
    });
}));
/**
 * Verify phone code
 */
app.post('/api/verify-email', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const remoteIpAddress = req.connection.remoteAddress;
    const code = req.body['code'];
    const verifyId = req.body['verifyId'];
    const targetEmail = req.body['email'];
    index_1.firestoreDB.collection('userInfo').where('email', '==', targetEmail)
        .get().then((userInfo) => {
        console.log('userInfo', userInfo.size, userInfo.empty);
        if (userInfo && !userInfo.empty && userInfo.size === 1) {
            const doc = userInfo.docs[0];
            const userId = doc.id;
            console.log(doc);
            const data = doc.data();
            console.log('data = ', data);
            const verifyRef = index_1.firestoreDB
                .collection('verification')
                .doc(userId)
                .collection('resetPassword')
                .doc(verifyId);
            return verifyRef.get().then((result) => {
                const verification = result.data();
                console.log(verification, req.body, !verification.isVerified, remoteIpAddress === verification.remoteIpAddress, targetEmail === verification.target, userId === verification.userId);
                if (!verification.isVerified
                    && remoteIpAddress === verification.remoteIpAddress
                    && targetEmail === verification.target
                    && userId === verification.userId) {
                    if (Number(verification.code) === Number(code)) {
                        index_1.firestoreDB.collection('protectedUser').doc(userId)
                            .get().then((protectedUserResult) => {
                            let phoneVerified = false;
                            if (protectedUserResult.exists && protectedUserResult.data().phoneVerified) {
                                phoneVerified = true;
                            }
                            console.log('ServerSuccess/CodeAccepted', 'CodeAccepted', phoneVerified);
                            const additionalClaims = {
                                phoneVerified: phoneVerified,
                                userName: data.email,
                                resetPasswordVerified: true
                            };
                            index_1.adminDB.auth().createCustomToken(userId, additionalClaims)
                                .then((token) => {
                                // Send token back to client
                                return res.status(httpStatusCode_1.HttpStatusCode.OK).json({ token });
                            })
                                .catch((error) => {
                                console.log('Error creating custom token:', error);
                                res.status(httpStatusCode_1.HttpStatusCode.InternalServerError).json(new index_2.SocialError('ServerError/CreateCustomToken', 'Create custom token error!'));
                            });
                        });
                    }
                    else {
                        res.status(httpStatusCode_1.HttpStatusCode.Forbidden).json(new index_2.SocialError('ServerError/WrongCode', 'The code is not correct!'));
                    }
                }
                else {
                    res.status(httpStatusCode_1.HttpStatusCode.Forbidden).send(new index_2.SocialError('ServerError/Unauthorized', 'User is Unauthorized!'));
                }
            })
                .catch((error) => {
                console.log('ServerError/VerifyIdNotAccept', error);
                return res.json(new index_2.SocialError('ServerError/VerifyIdNotAccept', "We coudn't for you verification!"));
            });
        }
        else {
            res.status(httpStatusCode_1.HttpStatusCode.NotFound).send(new index_2.SocialError('ServerError/EmailNotFound', 'Email not found!'));
        }
    })
        .catch((error) => {
        res.status(httpStatusCode_1.HttpStatusCode.NotFound).send(new index_2.SocialError('ServerError/EmailNotFound', 'Email not found!'));
    });
}));
/**
 * Reset password API
 */
app.post('/api/email-verification-code', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const remoteIpAddress = req.connection.remoteAddress;
    const gReCaptcha = req.body['g-recaptcha-response'];
    const code = Math.floor(1000 + Math.random() * 9000);
    const targetEmail = req.body['email'];
    const secretKey = functions.config().recaptcha.secretkey;
    const from = `${appName} Reset Password <${gmailEmail}>`;
    const to = targetEmail;
    const subject = `Reset your password for ${appName}`;
    index_1.firestoreDB.collection('userInfo').where('email', '==', targetEmail)
        .get().then((userInfoList) => {
        if (userInfoList.size === 1) {
            const user = userInfoList.docs[0].data();
            const userId = userInfoList.docs[0].id;
            const html = `
                <html xmlns="http://www.w3.org/1999/xhtml">

                <body>
                <div>
                    <h4>Hello ${user.fullName},</h4>

                    <p>Enter verification code in your reset password page to reset your ${appName} password for your ${targetEmail} account.</p>

                    <h3>Verification Code: ${code}</h3>

                    <p>If you didn’t ask to reset your password, you can ignore this email.</p>

                    <h4>Thanks,</h4>

                    <h4>Your ${appName} team</h4>
                </div>
                </body>
                </html>
                        `;
            if (gReCaptcha === undefined || gReCaptcha === '' || gReCaptcha === null) {
                return res.json(new index_2.SocialError('ServerError/NullCaptchaValue', 'Please select captcha first'));
            }
            const verificationURL = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secretKey + '&response=' + gReCaptcha + '&remoteip=' + remoteIpAddress;
            request(verificationURL, (error, response, body) => {
                body = JSON.parse(body);
                if (body.success !== undefined && !body.success) {
                    console.log('Captha/responseError', error);
                    return res.json(new index_2.SocialError('ServerError/ResponseCaptchaError', 'Failed captcha verification'));
                }
                console.log('Captha/responseSuccess');
                emailAPI_1.emailAPI.sendEmail(new email_1.Email(from, to, subject, html)).then(function (messageCreated) {
                    const verifyRef = index_1.firestoreDB.collection('verification').doc(userId).collection('resetPassword')
                        .doc();
                    const resetPasswordVerification = new Verification_1.Verification(verifyRef.id, String(code), targetEmail, moment().unix(), remoteIpAddress, userId);
                    verifyRef.set(Object.assign({}, resetPasswordVerification));
                    return res.status(httpStatusCode_1.HttpStatusCode.OK).json({ 'verifyId': verifyRef.id });
                }).catch((error) => {
                    res.status(httpStatusCode_1.HttpStatusCode.ServiceUnavailable).send(new index_2.SocialError('ServerError/EmailNotSent', 'Email service error. Email has not sent!'));
                });
            });
        }
        else {
            res.status(httpStatusCode_1.HttpStatusCode.NotFound).send(new index_2.SocialError('ServerError/EmailNotFound', 'Email not found!'));
        }
    })
        .catch((error) => {
        res.status(httpStatusCode_1.HttpStatusCode.NotFound).send(new index_2.SocialError('ServerError/EmailNotFound', 'With DB error. Email not found!'));
    });
}));
/**
 * Phone verification
 */
exports.publicAuth = functions.https.onRequest(app);
//# sourceMappingURL=publicAuthService.js.map