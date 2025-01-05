import fs from "node:fs";
import path from "node:path";
import DictionaryReader from "./DictionaryReader";
import SequentialDictionariesReader from "./SequentialDictionariesReader";

/**
 * IPADic
 */
class IPADic {
    /**
     * @constructor
     */
    #costMatrixDefinition: DictionaryReader;
    #characterDefinition: DictionaryReader;
    #unknownWordDefinition: DictionaryReader;
    #tokenInfoDictionaries: SequentialDictionariesReader;

    constructor(_dictionaryPath = "src/mecab-ipadic-seed/lib") {
        const dictionaryPath = path.join(process.cwd(), _dictionaryPath);
        console.log(dictionaryPath);
        this.#costMatrixDefinition = new DictionaryReader("matrix.def", dictionaryPath);
        this.#characterDefinition = new DictionaryReader("char.def", dictionaryPath);
        this.#unknownWordDefinition = new DictionaryReader("unk.def", dictionaryPath);
        const readers = fs
            .readdirSync(dictionaryPath)
            .filter((filename) => {
                return /\.csv$/.test(filename);
            })
            .map((filename) => {
                return new DictionaryReader(filename, dictionaryPath);
            });
        this.#tokenInfoDictionaries = new SequentialDictionariesReader(readers);
    }

    /**
     * Read cost matrix definition (matrix.def)
     * @param {function(line: string)} callback Line-by-line callback function
     * @returns {Promise} Promise which is resolved when reading completed
     */
    readMatrixDef(callback: (line: string) => void) {
        return this.#costMatrixDefinition.read(callback);
    }

    /**
     * Read character definition (char.def)
     * @param {function(line: string)} callback Line-by-line callback function
     * @returns {Promise} Promise which is resolved when reading completed
     */
    readCharDef(callback: (line: string) => void) {
        return this.#characterDefinition.read(callback);
    }

    /**
     * Read unknown word definition (unk.def)
     * @param {function(line: string)} callback Line-by-line callback function
     * @returns {Promise} Promise which is resolved when reading completed
     */
    readUnkDef(callback: (line: string) => void) {
        return this.#unknownWordDefinition.read(callback);
    }

    /**
     * Read token info dictionaries (*.csv) sequentially by filename
     * @param {function(line: string)} callback Line-by-line callback function
     * @returns {Promise} Promise which is resolved when reading completed
     */
    readTokenInfo(callback: (line: string) => void) {
        return this.#tokenInfoDictionaries.read(callback);
    }
}

export default IPADic;
