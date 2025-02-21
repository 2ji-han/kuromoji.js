import { ViterbiNode } from "./viterbi-node.js";
export declare class ViterbiLattice {
    nodes_end_at: ViterbiNode[][];
    eos_pos: number;
    /**
     * ViterbiLattice is a lattice in Viterbi algorithm
     * @constructor
     */
    constructor();
    /**
     * Append node to ViterbiLattice
     * @param {ViterbiNode} node
     */
    append(node: ViterbiNode): void;
    /**
     * Set ends with EOS (End of Statement)
     */
    appendEos(): void;
}
//# sourceMappingURL=viterbi-lattice.d.ts.map