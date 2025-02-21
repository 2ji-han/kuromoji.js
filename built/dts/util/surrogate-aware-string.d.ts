export declare class SurrogateAwareString {
    #private;
    length: number;
    /**
     * String wrapper for UTF-16 surrogate pair (4 bytes)
     * @param {string} str String to wrap
     * @constructor
     */
    constructor(str: string);
    slice(index: number): string;
    charAt(index: number): string;
    charCodeAt(index: number): number;
    toString(): string;
    add(other: SurrogateAwareString): SurrogateAwareString;
    append(str: string): SurrogateAwareString;
    static isSurrogatePair(ch: string): boolean;
}
//# sourceMappingURL=surrogate-aware-string.d.ts.map