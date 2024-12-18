import type DynamicDictionaries from "../dict/DynamicDictionaries";
import ViterbiLattice from "./ViterbiLattice";
declare class ViterbiBuilder {
    #private;
    /**
     * ViterbiBuilder builds word lattice (ViterbiLattice)
     * @param {DynamicDictionaries} dic dictionary
     * @constructor
     */
    constructor(dic: DynamicDictionaries);
    /**
     * Build word lattice
     * @param {string} sentence_str Input text
     * @returns {ViterbiLattice} Word lattice
     */
    build(sentence_str: string): ViterbiLattice;
}
export default ViterbiBuilder;
