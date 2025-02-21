import { DynamicDictionaries } from "./dict/dynamic-dictionaries.js";

function resolvePath(base: URL, path: string): URL {
    const { pathname } = base;
    return new URL(
        pathname.endsWith("/") ? pathname + path : pathname + "/" + path,
        base
    );
}

export interface DictionaryLoader {
    load(): Promise<DynamicDictionaries>;
}

export class GZipDictionaryLoader implements DictionaryLoader {
    #resourceBase: URL;
    private constructor(baseUrl: URL) {
        this.#resourceBase = baseUrl;
    }

    public static async fromURL(url: string | URL): Promise<DynamicDictionaries> {
        const baseUrl = typeof url === "string" ? new URL(url) : url;
        const loader = new GZipDictionaryLoader(baseUrl);
        return loader.load();
    }

    async #loadArrayBuffer(url: URL) {
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const decompressionStream = new DecompressionStream("gzip");
        const decompressedStream = new Blob([buffer]).stream().pipeThrough(decompressionStream);
        const decompressedBuffer = await new Response(decompressedStream).arrayBuffer();
        return decompressedBuffer;
    }

    async load(): Promise<DynamicDictionaries> {
        const dictionaries = new DynamicDictionaries();
        const buffers = await Promise.all(
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
            ].map((filename) => this.#loadArrayBuffer(resolvePath(this.#resourceBase, filename)))
        )
        // Trie
        dictionaries.loadTrie(new Int32Array(buffers[0]!), new Int32Array(buffers[1]!));
        // Token info dictionaries
        dictionaries.loadTokenInfoDictionaries(
            new Uint8Array(buffers[2]!),
            new Uint8Array(buffers[3]!),
            new Uint8Array(buffers[4]!)
        );
        // Connection cost matrix
        dictionaries.loadConnectionCosts(new Int16Array(buffers[5]!));
        // Unknown dictionaries
        dictionaries.loadUnknownDictionaries(
            new Uint8Array(buffers[6]!),
            new Uint8Array(buffers[7]!),
            new Uint8Array(buffers[8]!),
            new Uint8Array(buffers[9]!),
            new Uint32Array(buffers[10]!),
            new Uint8Array(buffers[11]!)
        );
        return dictionaries;
    }
}
