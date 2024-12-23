import path from "node:path";
import DynamicDictionaries from "../../_core/dict/DynamicDictionaries";

class DictionaryLoader {
    #dic_path: string;
    constructor(dic_path = "dict/") {
        this.#dic_path = dic_path;
    }

    #loadArrayBuffer = (url: string) =>
        new Promise<ArrayBufferLike>((resolve, reject) => {
            fetch(url)
                .then(async (res) => await res.arrayBuffer())
                .then(async (buffer) => {
                    const decompressionStream = new DecompressionStream("gzip");
                    const decompressedStream = new Blob([buffer]).stream().pipeThrough(decompressionStream);
                    const decompressedBuffer = await new Response(decompressedStream).arrayBuffer();
                    resolve(decompressedBuffer);
                })
                .catch((err) => {
                    reject(err);
                });
        });

    load(callback: (error: Error | null, dic: DynamicDictionaries) => void) {
        const dictionaries = new DynamicDictionaries();
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
                dictionaries.loadTrie(new Int32Array(buffers[0]), new Int32Array(buffers[1]));
                // Token info dictionaries
                dictionaries.loadTokenInfoDictionaries(
                    new Uint8Array(buffers[2]),
                    new Uint8Array(buffers[3]),
                    new Uint8Array(buffers[4])
                );
                // Connection cost matrix
                dictionaries.loadConnectionCosts(new Int16Array(buffers[5]));
                // Unknown dictionaries
                dictionaries.loadUnknownDictionaries(
                    new Uint8Array(buffers[6]),
                    new Uint8Array(buffers[7]),
                    new Uint8Array(buffers[8]),
                    new Uint8Array(buffers[9]),
                    new Uint32Array(buffers[10]),
                    new Uint8Array(buffers[11])
                );
                //// this.#dic.loadUnknownDictionaries(char_buffer, unk_buffer);
                callback(null, dictionaries);
            })
            .catch((error) => {
                callback(error, dictionaries);
            });
    }
}

export default DictionaryLoader;
