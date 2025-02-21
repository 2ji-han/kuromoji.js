export class SurrogateAwareString {
    #str;
    #index_mapping;
    length;
    /**
     * String wrapper for UTF-16 surrogate pair (4 bytes)
     * @param {string} str String to wrap
     * @constructor
     */
    constructor(str) {
        this.#str = str;
        this.#index_mapping = [];
        for (let pos = 0; pos < str.length; pos++) {
            const ch = str.charAt(pos);
            this.#index_mapping.push(pos);
            if (SurrogateAwareString.isSurrogatePair(ch)) {
                pos++;
            }
        }
        // Surrogate aware length
        this.length = this.#index_mapping.length;
    }
    slice(index) {
        if (this.#index_mapping.length <= index) {
            return "";
        }
        const surrogate_aware_index = this.#index_mapping[index];
        return this.#str.slice(surrogate_aware_index);
    }
    charAt(index) {
        if (this.#str.length <= index) {
            return "";
        }
        const surrogate_aware_start_index = this.#index_mapping[index];
        const surrogate_aware_end_index = this.#index_mapping[index + 1];
        if (surrogate_aware_end_index == null) {
            return this.#str.slice(surrogate_aware_start_index);
        }
        return this.#str.slice(surrogate_aware_start_index, surrogate_aware_end_index);
    }
    charCodeAt(index) {
        if (this.#index_mapping.length <= index) {
            return Number.NaN;
        }
        if (this.#index_mapping[index] == null) {
            throw new Error(`Invalid index: ${index}`);
        }
        const surrogate_aware_index = this.#index_mapping[index];
        const upper = this.#str.charCodeAt(surrogate_aware_index);
        let lower;
        if (upper >= 0xd800 && upper <= 0xdbff && surrogate_aware_index < this.#str.length) {
            lower = this.#str.charCodeAt(surrogate_aware_index + 1);
            if (lower >= 0xdc00 && lower <= 0xdfff) {
                return (upper - 0xd800) * 0x400 + lower - 0xdc00 + 0x10000;
            }
        }
        return upper;
    }
    toString() {
        return this.#str;
    }
    add(other) {
        return new SurrogateAwareString(this.#str + other.#str);
    }
    append(str) {
        return new SurrogateAwareString(this.#str + str);
    }
    static isSurrogatePair(ch) {
        const utf16_code = ch.charCodeAt(0);
        if (utf16_code >= 0xd800 && utf16_code <= 0xdbff) {
            // surrogate pair
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=surrogate-aware-string.js.map