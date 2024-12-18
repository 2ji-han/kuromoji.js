declare class ByteBuffer {
    buffer: Uint8Array;
    position: number;
    constructor(arg?: number | Uint8Array);
    size(): number;
    reallocate(): void;
    shrink(): Uint8Array<ArrayBufferLike>;
    put(b: number | boolean): void;
    get(_index?: number | null): number;
    putShort(num: number): void;
    getShort(_index: number | null): number;
    putInt(num: number): void;
    getInt(_index?: number | null): number;
    readInt(): number;
    putString(str: string): void;
    getString(_index?: number): string;
    getUtf32(_index?: number | null): number;
    getBool(_index?: number | null): boolean;
}
export default ByteBuffer;
