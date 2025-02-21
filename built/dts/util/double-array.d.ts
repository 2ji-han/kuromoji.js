export type TypedArrayBuffer = Uint8Array | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array;
export declare function createTypedArray(signed: boolean, bytes: number, size: number): TypedArrayBuffer;
declare class BufferController {
    #private;
    constructor(initial_size?: number);
    getBaseBuffer(): TypedArrayBuffer;
    getCheckBuffer(): TypedArrayBuffer;
    loadBaseBuffer(base_buffer: TypedArrayBuffer): this;
    loadCheckBuffer(check_buffer: TypedArrayBuffer): this;
    size(): number;
    getBase(index: number): number;
    getCheck(index: number): number;
    setBase(index: number, base_value: number): void;
    setCheck(index: number, check_value: number): void;
    setFirstUnusedNode(index: number): void;
    getFirstUnusedNode(): number;
    shrink(): void;
    calc(): {
        all: number;
        unused: number;
        efficiency: number;
    };
    dump(): string;
}
/**
 * Factory method of double array
 */
declare class DoubleArrayBuilder {
    #private;
    constructor(initial_size?: number);
    /**
     * Append a key to initialize set
     * (This method should be called by dictionary ordered key)
     *
     * @param {String} key
     * @param {Number} value Integer value from 0 to max signed integer number - 1
     */
    append(key: string, record: number): this;
    /**
     * Build double array for given keys
     *
     * @param {Array} keys Array of keys. A key is a Object which has properties 'k', 'v'.
     * 'k' is a key string, 'v' is a record assigned to that key.
     * @return {DoubleArray} Compiled double array
     */
    build(keys?: {
        k: string | Uint8Array;
        v: number;
    }[], sorted?: boolean): DoubleArray;
}
/**
 * Factory method of double array
 */
declare class DoubleArray {
    #private;
    constructor(bufferController: BufferController);
    get bufferController(): BufferController;
    /**
     * Look up a given key in this trie
     *
     * @param {String} key
     * @return {Boolean} True if this trie contains a given key
     */
    contain(_key: string): boolean;
    /**
     * Look up a given key in this trie
     *
     * @param {String} key
     * @return {Number} Record value assgned to this key, -1 if this key does not contain
     */
    lookup(_key: string): number;
    /**
     * Common prefix search
     *
     * @param {String} key
     * @return {Array} Each result object has 'k' and 'v' (key and record,
     * respectively) properties assigned to matched string
     */
    commonPrefixSearch(key: string): {
        k: string;
        v: number;
    }[];
    size(): number;
    calc(): {
        all: number;
        unused: number;
        efficiency: number;
    };
    dump(): string;
}
export { DoubleArrayBuilder, DoubleArray };
declare const _default: {
    builder: (initial_size?: number) => DoubleArrayBuilder;
    load: (base_buffer: TypedArrayBuffer, check_buffer: TypedArrayBuffer) => DoubleArray;
};
export default _default;
//# sourceMappingURL=double-array.d.ts.map