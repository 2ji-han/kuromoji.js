export class SurrogateAwareString {
    /**
     * String wrapper for UTF-16 surrogate pair (4 bytes)
     * @param {string} str String to wrap
     * @constructor
     */
    private constructor(
        private readonly str: string[],
        private readonly index_mapping: number[],
        public readonly length: number,
    ) { }

    public static create(str: string) {
        const string: string[] = [];
        const index_mapping: number[] = [];
        for (let pos = 0; pos < str.length; pos++) {
            const ch = str[pos];
            string.push(ch);
            index_mapping.push(pos);
        }
        const length = index_mapping.length;
        return new SurrogateAwareString(string, index_mapping, length);
    }

    public slice(index: number): string {
        if (this.index_mapping.length <= index) {
            return "";
        }
        const surrogate_aware_index = this.index_mapping[index];
        return this.str.slice(surrogate_aware_index).join("");
    }

    public static isSurrogatePair(ch: string): boolean {
        const utf16_code = ch.charCodeAt(0);
        if (utf16_code >= 0xd800 && utf16_code <= 0xdbff) {
            // surrogate pair
            return true;
        }
        return false;
    }
}
