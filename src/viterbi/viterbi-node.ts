export type WORD_TYPE = "KNOWN" | "UNKNOWN" | "BOS" | "EOS";

export class ViterbiNode {
    name: number;
    cost: number;
    start_pos: number;
    length: number;
    left_id: number;
    right_id: number;
    prev: null | ViterbiNode;
    surface_form: string;
    shortest_cost: number;
    type: WORD_TYPE;

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
    constructor(
        node_name: number,
        node_cost: number,
        start_pos: number,
        length: number,
        type: WORD_TYPE,
        left_id: number,
        right_id: number,
        surface_form: string
    ) {
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
