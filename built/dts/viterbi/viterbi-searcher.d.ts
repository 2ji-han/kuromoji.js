import type { ConnectionCosts } from "../dict/connection-costs.js";
import type { ViterbiLattice } from "./viterbi-lattice.js";
import type { ViterbiNode } from "./viterbi-node.js";
export declare class ViterbiSearcher {
    #private;
    /**
     * ViterbiSearcher is for searching best Viterbi path
     * @param {ConnectionCosts} connection_costs Connection costs matrix
     * @constructor
     */
    constructor(connection_costs: ConnectionCosts);
    /**
     * Search best path by forward-backward algorithm
     * @param {ViterbiLattice} lattice Viterbi lattice to search
     * @returns {Array} Shortest path
     */
    search(_lattice: ViterbiLattice): ViterbiNode[];
}
//# sourceMappingURL=viterbi-searcher.d.ts.map