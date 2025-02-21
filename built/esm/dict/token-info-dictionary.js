import { ByteBuffer } from "../util/byte-buffer.js";
export class TokenInfoDictionary {
    #dictionary;
    #target_map;
    #pos_buffer;
    constructor() {
        this.#dictionary = new ByteBuffer(10 * 1024 * 1024);
        this.#target_map = {}; // trie_id (of surface form) -> token_info_id (of token)
        this.#pos_buffer = new ByteBuffer(10 * 1024 * 1024);
    }
    get dictionary() {
        return this.#dictionary;
    }
    get target_map() {
        return this.#target_map;
    }
    get pos_buffer() {
        return this.#pos_buffer;
    }
    // left_id right_id word_cost ...
    // ^ this position is token_info_id
    buildDictionary(entries) {
        const dictionary_entries = {}; // using as hashmap, string -> string (word_id -> surface_form) to build dictionary
        // for (let i = 0; i < entries.length; i++) {
        //     const entry = entries[i];
        for (const entry of entries) {
            if (entry.length < 4) {
                throw new Error(`Invalid TokenInfoDictionary entry: ${entry}`);
            }
            const surface_form = entry[0];
            const left_id = Number.parseInt(entry[1]);
            const right_id = Number.parseInt(entry[2]);
            const word_cost = Number.parseInt(entry[3]);
            const feature = entry.slice(4).join(","); // TODO Optimize
            // Assertion
            if (!Number.isFinite(left_id) ||
                !Number.isFinite(right_id) ||
                !Number.isFinite(word_cost)) {
                console.log(entry);
            }
            const token_info_id = this.put(left_id, right_id, word_cost, surface_form, feature);
            dictionary_entries[token_info_id] = surface_form;
        }
        // Remove last unused area
        this.#dictionary.shrink();
        this.#pos_buffer.shrink();
        return dictionary_entries;
    }
    put(left_id, right_id, word_cost, surface_form, feature) {
        const token_info_id = this.#dictionary.position;
        const pos_id = this.#pos_buffer.position;
        this.#dictionary.putShort(left_id);
        this.#dictionary.putShort(right_id);
        this.#dictionary.putShort(word_cost);
        this.#dictionary.putInt(pos_id);
        this.#pos_buffer.putString(`${surface_form},${feature}`);
        return token_info_id;
    }
    addMapping(source, target) {
        let mapping = this.#target_map[source];
        if (mapping == null) {
            mapping = [];
        }
        mapping.push(target);
        this.#target_map[source] = mapping;
    }
    targetMapToBuffer() {
        const buffer = new ByteBuffer();
        buffer.putInt(Object.keys(this.#target_map).length);
        for (const _key in this.#target_map) {
            const key = Number.parseInt(_key);
            const values = this.#target_map[key]; // Array
            if (!values)
                continue;
            const map_values_size = values.length;
            buffer.putInt(key);
            buffer.putInt(map_values_size);
            for (const value of values) {
                buffer.putInt(value);
            }
        }
        return buffer.shrink(); // Shrink-ed Typed Array
    }
    // from tid.dat
    loadDictionary(array_buffer) {
        this.#dictionary = new ByteBuffer(array_buffer);
        return this;
    }
    // from tid_pos.dat
    loadPosVector(array_buffer) {
        this.#pos_buffer = new ByteBuffer(array_buffer);
        return this;
    }
    // from tid_map.dat
    loadTargetMap(array_buffer) {
        const buffer = new ByteBuffer(array_buffer);
        buffer.position = 0;
        this.#target_map = {};
        buffer.readInt(); // map_keys_size
        while (true) {
            if (buffer.buffer.length < buffer.position + 1) {
                break;
            }
            const key = buffer.readInt();
            const map_values_size = buffer.readInt();
            for (let i = 0; i < map_values_size; i++) {
                const value = buffer.readInt();
                this.addMapping(key, value);
            }
        }
        return this;
    }
    getFeatures(token_info_id) {
        if (Number.isNaN(token_info_id)) {
            return null;
        }
        const pos_id = this.#dictionary.getInt(token_info_id + 6);
        return this.#pos_buffer.getString(pos_id);
    }
}
//# sourceMappingURL=token-info-dictionary.js.map