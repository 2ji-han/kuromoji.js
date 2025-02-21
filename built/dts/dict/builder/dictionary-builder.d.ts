import { DoubleArray } from "../../double-array.js";
import { DynamicDictionaries } from "../dynamic-dictionaries.js";
import { UnknownDictionary } from "../unknown-dictionary.js";
declare class DictionaryBuilder {
    #private;
    /**
     * Build dictionaries (token info, connection costs)
     *
     * Generates from matrix.def
     * cc.dat: Connection costs
     *
     * Generates from *.csv
     * dat.dat: Double array
     * tid.dat: Token info dictionary
     * tid_map.dat: targetMap
     * tid_pos.dat: posList (part of speech)
     */
    constructor();
    addTokenInfoDictionary(line: string): this;
    /**
     * Put one line of "matrix.def" file for building ConnectionCosts object
     * @param {string} line is a line of "matrix.def"
     */
    putCostMatrixLine(line: string): this;
    putCharDefLine(line: string): this;
    /**
     * Put one line of "unk.def" file for building UnknownDictionary object
     * @param {string} line is a line of "unk.def"
     */
    putUnkDefLine(line: string): this;
    build(): DynamicDictionaries;
    /**
     * Build TokenInfoDictionary
     *
     * @returns {{trie: *, token_info_dictionary: *}}
     */
    buildTokenInfoDictionary(): {
        trie: any;
        token_info_dictionary: any;
    };
    buildUnknownDictionary(): UnknownDictionary;
    /**
     * Build double array trie
     *
     * @returns {DoubleArray} Double-Array trie
     */
    buildDoubleArray(): DoubleArray;
}
export default DictionaryBuilder;
//# sourceMappingURL=dictionary-builder.d.ts.map