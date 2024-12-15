import DynamicDictionaries from "../DynamicDictionaries";
import TokenInfoDictionary from "../TokenInfoDictionary";
import UnknownDictionary from "../UnknownDictionary";
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
        trie: import("../../util/DoubleArray").DoubleArray;
        token_info_dictionary: TokenInfoDictionary;
    };
    buildUnknownDictionary(): UnknownDictionary;
    /**
     * Build double array trie
     *
     * @returns {DoubleArray} Double-Array trie
     */
    buildDoubleArray(): import("../../util/DoubleArray").DoubleArray;
}
export default DictionaryBuilder;
