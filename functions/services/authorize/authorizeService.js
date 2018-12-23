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
const circle_1 = require("../../domain/circles/circle");
const moment = require("moment");
const express = require("express");
const bodyParser = require("body-parser");
const index_2 = require("../../domain/common/index");
const Verification_1 = require("../../domain/authorize/Verification");
const httpStatusCode_1 = require("../../data/httpStatusCode");
const plivo = require('plivo');
const request = require('request');
const cookieParser = require('cookie-parser')();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const appName = functions.config().setting.appname;
/**
 * Handle on user create
 */
exports.onUserCreate = functions.auth.user().onCreate((change, context) => {
    return new Promise((resolve, reject) => {
        const user = change;
        const followingCircle = new circle_1.Circle();
        followingCircle.creationDate = moment().unix();
        followingCircle.name = `Following`;
        followingCircle.ownerId = user.uid;
        followingCircle.isSystem = true;
        return index_1.firestoreDB.collection(`users`).doc(user.uid).collection(`circles`).add(Object.assign({}, followingCircle))
            .then((result) => {
            resolve();
        }).catch(reject);
    });
});
// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = (req, res, next) => {
    console.log('Check if request is authorized with Firebase ID token');
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !req.cookies.__session) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.', 'Make sure you authorize your request by providing the following HTTP header:', 'Authorization: Bearer <Firebase ID Token>', 'or by passing a "__session" cookie.');
        res.status(httpStatusCode_1.HttpStatusCode.Forbidden).send(new index_2.SocialError('ServerError/Unauthorized', 'User is Unauthorized!'));
        return;
    }
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    }
    else {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    }
    index_1.adminDB.auth().verifyIdToken(idToken).then((decodedIdToken) => {
        console.log('ID Token correctly decoded', decodedIdToken);
        req.user = decodedIdToken;
        return next();
    }).catch((error) => {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(httpStatusCode_1.HttpStatusCode.Forbidden).send(new index_2.SocialError('ServerError/Unauthorized', 'User is Unauthorized!'));
    });
};
const app = express();
const cors = require('cors')({ origin: true });
app.disable('x-powered-by');
app.use(cors);
app.use(bodyParser.json());
app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.post('/api/sms-verification', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const remoteIpAddress = req.connection.remoteAddress;
    const gReCaptcha = req.body['g-recaptcha-response'];
    const code = Math.floor(1000 + Math.random() * 9000);
    const sourcePhoneNumber = '+111111';
    const targetPhoneNumber = req.body['phoneNumber'];
    const phoneMessage = `Verification code from ${appName} : <CODE>`;
    const secretKey = functions.config().recaptcha.secretkey;
    const userId = req.user.uid;
    if (gReCaptcha === undefined || gReCaptcha === '' || gReCaptcha === null) {
        return res.json(new index_2.SocialError('ServerError/NullCaptchaValue', 'Please select captcha first'));
    }
    const verificationURL = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secretKey + '&response=' + gReCaptcha + '&remoteip=' + remoteIpAddress;
    request(verificationURL, (error, response, body) => {
        body = JSON.parse(body);
        if (body.success !== undefined && !body.success) {
            console.log('Captha/responseError', error);
            console.log('Captha/responseError', response);
            console.log('Captha/responseError', body);
            res.status(httpStatusCode_1.HttpStatusCode.BadRequest).json(new index_2.SocialError('ServerError/ResponseCaptchaError', 'Failed captcha verification'));
        }
        console.log('Captha/responseSuccess');
        const client = new plivo.Client(functions.config().plivo.authid, functions.config().plivo.authtoken);
        client.messages.create(sourcePhoneNumber, targetPhoneNumber, phoneMessage.replace('<CODE>', String(code)))
            .then((messageCreated) => {
            const verifyRef = index_1.firestoreDB.collection('verification').doc(userId).collection('phone')
                .doc();
            const phoneVerification = new Verification_1.Verification(verifyRef.id, String(code), targetPhoneNumber, moment().unix(), remoteIpAddress, userId);
            verifyRef.set(Object.assign({}, phoneVerification));
            return res.status(httpStatusCode_1.HttpStatusCode.OK).json({ 'verifyId': verifyRef.id });
        });
    });
}));
/**
 * Verify phone code
 */
app.post('/api/verify-phone', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const remoteIpAddress = req.connection.remoteAddress;
    const code = req.body['code'];
    const verifyId = req.body['verifyId'];
    const targetPhoneNumber = req.body['phoneNumber'];
    const userId = req.user.uid;
    const verifyRef = index_1.firestoreDB
        .collection('verification')
        .doc(userId)
        .collection('phone')
        .doc(verifyId);
    return verifyRef.get().then((result) => {
        const phoneVerification = result.data();
        console.log(phoneVerification, req.body, !phoneVerification.isVerified, remoteIpAddress === phoneVerification.remoteIpAddress, targetPhoneNumber === phoneVerification.target, userId === phoneVerification.userId);
        if (!phoneVerification.isVerified
            && remoteIpAddress === phoneVerification.remoteIpAddress
            && targetPhoneNumber === phoneVerification.target
            && userId === phoneVerification.userId) {
            if (Number(phoneVerification.code) === Number(code)) {
                const batch = index_1.firestoreDB.batch();
                batch.update(result.ref, { isVerified: true });
                const protectedUserRef = index_1.firestoreDB
                    .collection('protectedUser')
                    .doc(userId);
                batch.update(protectedUserRef, { phoneVerified: true });
                batch.commit().then(() => {
                    console.log('ServerSuccess/CodeAccepted', 'CodeAccepted');
                    const additionalClaims = {
                        phoneVerified: true
                    };
                    index_1.adminDB.auth().createCustomToken(userId, additionalClaims)
                        .then((token) => {
                        // Send token back to client
                        return res.status(httpStatusCode_1.HttpStatusCode.OK).json({ token });
                    })
                        .catch((error) => {
                        console.log('Error creating custom token:', error);
                    });
                })
                    .catch((error) => {
                    console.log('ServerError/CanUpdateState', error);
                    res.json(new index_2.SocialError('ServerError/CanUpdateState', 'Can not update user state!'));
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
}));
/**
 * Register user
 */
app.post('/api/register', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const remoteIpAddress = req.connection.remoteAddress;
    const userName = req.body['userName'];
    const password = req.body['password'];
    const email = req.body['email'];
    const fullName = req.body['fullName'];
    const avatar = req.body['avatar'];
    const userId = req.user.uid;
    index_1.firestoreDB.doc(`userInfo/${userId}`).set({
        id: userId,
        state: 'active',
        avatar,
        fullName,
        creationDate: moment().unix(),
        email
    }).then(() => {
        bcrypt.hash(password, saltRounds, function (error, hash) {
            // Store hash in your password DB.
            index_1.firestoreDB.collection('protectedUser').doc(userId)
                .set({
                userName: userName,
                password: hash,
                phoneVerified: false
            }).then(() => {
                return res.status(httpStatusCode_1.HttpStatusCode.OK).json({});
            }).catch((error) => {
                res.status(httpStatusCode_1.HttpStatusCode.InternalServerError).send(new index_2.SocialError('ServerError/NotStoreProtectedUser', 'Can not store protected user!'));
            });
        });
    }).catch((error) => {
        res.status(httpStatusCode_1.HttpStatusCode.InternalServerError).send(new index_2.SocialError('ServerError/NotStoreUserInfo', 'Can not store user info!'));
    });
}));
/**
 * Register user
 */
app.post('/api/update-password', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const remoteIpAddress = req.connection.remoteAddress;
    const newPassword = req.body['newPassword'];
    const confirmPassword = req.body['confirmPassword'];
    const userId = req.user.uid;
    console.log('userID: ', userId);
    if ((newPassword && confirmPassword)
        && (newPassword.trim() !== '' && confirmPassword.trim() !== '')
        && (confirmPassword === newPassword)) {
        index_1.adminDB.auth().updateUser(userId, {
            password: newPassword
        }).then((updateResult) => {
            bcrypt.hash(newPassword, saltRounds, function (error, hash) {
                // Store hash in your password DB.
                index_1.firestoreDB.collection('protectedUser').doc(userId)
                    .update({
                    password: hash,
                }).then(() => {
                    return res.status(httpStatusCode_1.HttpStatusCode.OK).json({});
                }).catch((error) => {
                    console.log('ServerError/NotStoreProtectedUser', error);
                    res.status(httpStatusCode_1.HttpStatusCode.InternalServerError).send(new index_2.SocialError('ServerError/NotStoreProtectedUser', 'Can not store protected user!'));
                });
            });
        })
            .catch((error) => {
            console.log('UpdateUser/Password', error);
            res.status(httpStatusCode_1.HttpStatusCode.InternalServerError).send(new index_2.SocialError('ServerError/ErrorUpdateUser', 'Can not update user!'));
        });
    }
    else {
        res.status(httpStatusCode_1.HttpStatusCode.InternalServerError).send(new index_2.SocialError('ServerError/NotEqualConfirmNewPassword', 'Confirm password and new password are not equal!'));
    }
}));
/**
 * Phone verification
 */
exports.auth = functions.https.onRequest(app);
//# sourceMappingURL=authorizeService.js.map