import type ConnectionCosts from "../dict/ConnectionCosts";
import type ViterbiLattice from "./ViterbiLattice";
import type ViterbiNode from "./ViterbiNode";
declare class ViterbiSearcher {
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
export default ViterbiSearcher;
