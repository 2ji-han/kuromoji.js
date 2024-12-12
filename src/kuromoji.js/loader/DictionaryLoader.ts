import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import DynamicDictionaries from "../dict/DynamicDictionaries";

class DictionaryLoader {
    #dic: DynamicDictionaries;
    #dic_path: string;
    constructor(dic_path = "dict/") {
        this.#dic = new DynamicDictionaries();
        this.#dic_path = dic_path;
    }

    #loadArrayBuffer = (file: string) =>
        new Promise<ArrayBufferLike>((resolve, reject) => {
            if (!existsSync(file)) return reject(new Error(`${file} does not exist`));
            const buffer = readFileSync(file);
            zlib.gunzip(new Uint8Array(buffer), (err, binary) => {
                if (err) return reject(err);
                const typed_array = new Uint8Array(binary);
                resolve(typed_array.buffer);
            });
        });

    load(callback: (error: Error[] | null, dic: DynamicDictionaries) => void) {
        Promise.all(
            [
                // Trie
                "base.dat.gz",
                "check.dat.gz",
                // Token info dictionaries
                "tid.dat.gz",
                "tid_pos.dat.gz",
                "tid_map.dat.gz",
                // Connection cost matrix
                "cc.dat.gz",
                // Unknown dictionaries
                "unk.dat.gz",
                "unk_pos.dat.gz",
                "unk_map.dat.gz",
                "unk_char.dat.gz",
                "unk_compat.dat.gz",
                "unk_invoke.dat.gz",
            ].map((filename) => this.#loadArrayBuffer(path.join(this.#dic_path, filename)))
        )
            .then((buffers) => {
                // Trie
                this.#dic.loadTrie(new Int32Array(buffers[0]), new Int32Array(buffers[1]));
                // Token info dictionaries
                this.#dic.loadTokenInfoDictionaries(
                    new Uint8Array(buffers[2]),
                    new Uint8Array(buffers[3]),
                    new Uint8Array(buffers[4])
                );
                // Connection cost matrix
                this.#dic.loadConnectionCosts(new Int16Array(buffers[5]));
                // Unknown dictionaries
                this.#dic.loadUnknownDictionaries(
                    new Uint8Array(buffers[6]),
                    new Uint8Array(buffers[7]),
                    new Uint8Array(buffers[8]),
                    new Uint8Array(buffers[9]),
                    new Uint32Array(buffers[10]),
                    new Uint8Array(buffers[11])
                );
                //// this.#dic.loadUnknownDictionaries(char_buffer, unk_buffer);
                callback(null, this.#dic);
            })
            .catch((error) => {
                callback(error, this.#dic);
            });
    }
}

export default DictionaryLoader;
