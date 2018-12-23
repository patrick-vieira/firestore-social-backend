"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
exports.adminDB = admin.initializeApp();
exports.firestoreDB = exports.adminDB.firestore();
//# sourceMappingURL=index.js.map