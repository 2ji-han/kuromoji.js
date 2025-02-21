export class ViterbiNode {
    name;
    cost;
    start_pos;
    length;
    left_id;
    right_id;
    prev;
    surface_form;
    shortest_cost;
    type;
    /**
     * ViterbiNode is a node of ViterbiLattice
     * @param {number} node_name Word ID
     * @param {number} node_cost Word cost to generate
     * @param {number} start_pos Start position from 1
     * @param {number} length Word length
     * @param {string} type Node type (KNOWN, UNKNOWN, BOS, EOS, ...)
     * @param {number} left_id Left context ID
     * @param {number} right_id Right context ID
     * @param {string} surface_form Surface form of this word
     * @constructor
     */
    constructor(node_name, node_cost, start_pos, length, type, left_id, right_id, surface_form) {
        this.name = node_name;
        this.cost = node_cost;
        this.start_pos = start_pos;
        this.length = length;
        this.left_id = left_id;
        this.right_id = right_id;
        this.prev = null;
        this.surface_form = surface_form;
        this.shortest_cost = type === "BOS" ? 0 : Number.MAX_VALUE;
        this.type = type;
    }
}
//# sourceMappingURL=viterbi-node.js.map