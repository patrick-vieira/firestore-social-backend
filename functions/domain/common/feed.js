"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Feed {
    /**
     * Constructor
     */
    constructor(
    /**
     * Feed identifier
     */
    id, 
    /**
     * Feed text
     */
    text, 
    /**
     * Feed type
     */
    feedType, 
    /**
     * The user who send the feedback
     */
    user) {
        this.id = id;
        this.text = text;
        this.feedType = feedType;
        this.user = user;
    }
}
exports.Feed = Feed;
//# sourceMappingURL=feed.js.map