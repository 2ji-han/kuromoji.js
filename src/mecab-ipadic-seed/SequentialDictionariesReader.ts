import type DictionaryReader from "./DictionaryReader";

class SequentialDictionariesReader {
    readers: DictionaryReader[];
    /**
     * @constructor
     * @param {DictionaryReader[]} readers Dictionary readers in order
     */
    constructor(readers: DictionaryReader[]) {
        this.readers = readers;
    }

    /**
     * Read dictionaries sequentially
     * @param {function(line: string)} callback Line-by-line callback function
     * @returns {Promise} Last promise
     */
    async read(callback: (line: string) => void) {
        for (const reader of this.readers) {
            await reader.read((line) => {
                callback(line);
            });
        }
    }
}

export default SequentialDictionariesReader;
