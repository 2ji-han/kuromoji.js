import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

/**
 * MeCab seed dictionary reader
 */
class DictionaryReader {
    #filename: string;
    #dictionaryPath: string;

    /**
     * @constructor
     * @param {string} filename
     */
    constructor(filename: string, dictionaryPath: string) {
        this.#filename = filename;
        this.#dictionaryPath = dictionaryPath;
    }

    /**
     * Read dictionary file
     * @param {function(line: string)} callback Line-by-line callback function
     * @returns {Promise} Promise which is resolved when reading completed
     */
    read(callback: (line: string) => void) {
        return new Promise<void>((resolve) => {
            const rl = readline.createInterface({
                input: fs.createReadStream(path.join(this.#dictionaryPath, this.#filename)),
            });
            rl.on("line", (line) => {
                callback(line);
            });
            rl.on("close", () => {
                resolve();
            });
        });
    }
}

export default DictionaryReader;
