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
const express = require("express");
const httpStatusCode_1 = require("../../data/httpStatusCode");
const index_2 = require("../../domain/common/index");
const app = express();
app.disable('x-powered-by');
/**
 * Get users by user identifier list
 * @param userIdList A list of user key
 */
const getUserByListId = (userIdList) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        let users = {};
        if (userIdList && userIdList.length > 0) {
            userIdList.forEach((userId) => {
                index_1.firestoreDB.collection('userInfo').doc(userId).get().then((result) => {
                    let user = result.data();
                    users = Object.assign({}, users, { [userId]: Object.assign({}, user) });
                }).catch(reject);
            });
            resolve(users);
        }
    });
});
/**
 * Get users by  http trigget
 * Route ['users/']
 * Method [POST]
 */
app.post('/', (request, response) => __awaiter(this, void 0, void 0, function* () {
    const userIdList = JSON.parse(request.body);
    if (userIdList && Array.isArray(userIdList) && userIdList.length > 0) {
        getUserByListId(userIdList)
            .then((users) => {
            response.status(httpStatusCode_1.HttpStatusCode.OK).send(users);
        });
    }
    else {
        // Send baack bad request happened
        return response.status(httpStatusCode_1.HttpStatusCode.BadRequest)
            .send(new index_2.SocialError('UserService/UserIdListNotValid', `
        User list is undefined or not array or the length of array is not grater than zero!
        ${JSON.stringify(userIdList)}
        `));
    }
}));
/**
 * Routing posts
 */
exports.users = functions.https.onRequest(app);
/**
 * Handle on update user information
 */
exports.onUpdateUserInfo = functions.firestore.document('userInfo/{userId}')
    .onUpdate((dataSnapshot, context) => {
    return new Promise((resolve, reject) => {
        const userId = context.params.userId;
        const previousUserInfo = dataSnapshot.before.data();
        const userInfo = dataSnapshot.after.data();
        if (previousUserInfo.avatar === userInfo.avatar && previousUserInfo.fullName === userInfo.fullName) {
            resolve();
        }
        else {
            const postsRef = index_1.firestoreDB.collection('posts').where('ownerUserId', '==', userId);
            const commentsRef = index_1.firestoreDB.collection('comments').where('userId', '==', userId);
            const leftUserTieRef = index_1.firestoreDB.collection('graphs:users').where('leftNode', '==', userId);
            const rightUserTieRef = index_1.firestoreDB.collection('graphs:users').where('rightNode', '==', userId);
            // Get a new write batch
            var batch = index_1.firestoreDB.batch();
            postsRef.get().then((posts) => {
                commentsRef.get().then((comments) => {
                    leftUserTieRef.get().then((leftTies) => {
                        rightUserTieRef.get().then((rightTies) => {
                            // Set update batch for posts
                            posts.forEach((post) => {
                                const updatedPost = post.data();
                                updatedPost.ownerAvatar = userInfo.avatar;
                                updatedPost.ownerDisplayName = userInfo.fullName;
                                batch.update(post.ref, updatedPost);
                            });
                            // Set update batch for comments
                            comments.forEach((comment) => {
                                const updatedComment = comment.data();
                                updatedComment.userDisplayName = userInfo.avatar;
                                updatedComment.userDisplayName = userInfo.fullName;
                                batch.update(comment.ref, updatedComment);
                            });
                            // Set update batch for leftTies
                            leftTies.forEach((leftTie) => {
                                const updatedGraph = leftTie.data();
                                const updatedLeftTie = updatedGraph.LeftMetadata;
                                updatedLeftTie.avatar = userInfo.avatar;
                                updatedLeftTie.fullName = userInfo.fullName;
                                updatedGraph.LeftMetadata = updatedLeftTie;
                                batch.update(leftTie.ref, updatedGraph);
                            });
                            // Set update batch for rightTies
                            rightTies.forEach((rightTie) => {
                                const updatedGraph = rightTie.data();
                                const updatedRightTie = updatedGraph.rightMetadata;
                                updatedRightTie.avatar = userInfo.avatar;
                                updatedRightTie.fullName = userInfo.fullName;
                                updatedGraph.rightMetadata = updatedRightTie;
                                batch.update(rightTie.ref, updatedGraph);
                            });
                            batch.commit().then(() => {
                                resolve();
                            })
                                .catch(reject);
                        });
                    });
                });
            });
        }
    });
});
//# sourceMappingURL=userService.js.map