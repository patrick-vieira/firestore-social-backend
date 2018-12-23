"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const index_1 = require("../../data/index");
const _ = require("lodash");
/**
 * Add comment
 */
exports.onAddComment = functions.firestore
    .document(`comments/{commentId}`)
    .onCreate((dataSnapshot, event) => {
    var newComment = dataSnapshot.data();
    const commentId = event.params.commentId;
    if (newComment) {
        const postRef = index_1.firestoreDB.doc(`posts/${newComment.postId}`);
        // Get post
        var postId = newComment.postId;
        /**
         * Increase comment counter and create three comments' slide preview
         */
        return index_1.firestoreDB.runTransaction((transaction) => {
            return transaction.get(postRef).then((postDoc) => {
                if (postDoc.exists) {
                    const postData = postDoc.data();
                    const commentCount = postData.commentCounter + 1;
                    transaction.update(postRef, { commentCounter: commentCount });
                    let comments = postData.comments;
                    if (!comments) {
                        comments = {};
                    }
                    if (commentCount < 4) {
                        transaction.update(postRef, { comments: Object.assign({}, comments, { [commentId]: newComment }) });
                    }
                    else {
                        let sortedObjects = Object.assign({}, comments, { [commentId]: newComment });
                        // Sort posts with creation date
                        sortedObjects = _.fromPairs(_.toPairs(sortedObjects)
                            .sort((a, b) => parseInt(b[1].creationDate, 10) - parseInt(a[1].creationDate, 10)).slice(0, 3));
                        transaction.update(postRef, { comments: Object.assign({}, sortedObjects) });
                    }
                }
            });
        });
    }
});
/**
 * Delete comment
 */
exports.onDeleteComment = functions.firestore
    .document(`comments/{commentId}`)
    .onDelete((dataSnapshot, context) => {
    return new Promise((resolve, reject) => {
        const deletedComment = dataSnapshot.data();
        const commentId = context.params.commentId;
        const postId = deletedComment.postId;
        const postRef = index_1.firestoreDB.doc(`posts/${postId}`);
        index_1.firestoreDB.collection(`comments`)
            .where(`postId`, `==`, postId)
            .orderBy('creationDate', 'desc')
            .get().then((result) => {
            let parsedData = {};
            let index = 0;
            result.forEach((comment) => {
                if (index < 3) {
                    const commentData = comment.data();
                    commentData.id = comment.id;
                    parsedData = Object.assign({}, parsedData, { [comment.id]: Object.assign({}, commentData) });
                }
                index++;
            });
            postRef.update({ comments: parsedData, commentCounter: result.size })
                .then(() => {
                resolve();
            });
        }).catch(reject);
    });
});
//# sourceMappingURL=commentService.js.map