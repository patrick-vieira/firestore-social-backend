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
const express = require("express");
const app = express();
app.disable('x-powered-by');
app.get('/:postId/comments', (request, response) => __awaiter(this, void 0, void 0, function* () {
    return response.status(200).send(`post`);
}));
/**
 * Routing posts
 */
exports.posts = functions.https.onRequest(app);
//# sourceMappingURL=postService.js.map