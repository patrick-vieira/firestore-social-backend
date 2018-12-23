"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
class Graph extends common_1.BaseDomain {
    constructor(
    /**
     * Left node of graph
     *
     * @type {string}
     * @memberof Graph
     */
    leftNode, 
    /**
     * Graph relationship type
     *
     * @type {number}
     * @memberof Graph
     */
    edgeType, 
    /**
     * Right node of graph
     *
     * @type {string}
     * @memberof Graph
     */
    rightNode, 
    /**
     * Graph left node metadata
     *
     * @memberof Graph
     */
    LeftMetadata, 
    /**
     * Graph right node metadata
     *
     * @memberof Graph
     */
    rightMetadata, 
    /**
     * Graph metadata
     *
     * @type {string}
     * @memberof Graph
     */
    graphMetadata, 
    /**
     * Graph node identifier
     *
     * @type {string}
     * @memberof Graph
     */
    nodeId) {
        super();
        this.leftNode = leftNode;
        this.edgeType = edgeType;
        this.rightNode = rightNode;
        this.LeftMetadata = LeftMetadata;
        this.rightMetadata = rightMetadata;
        this.graphMetadata = graphMetadata;
        this.nodeId = nodeId;
    }
}
exports.Graph = Graph;
//# sourceMappingURL=graph.js.map