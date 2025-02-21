export declare class ByteBuffer {
    #private;
    get buffer(): Uint8Array<ArrayBufferLike>;
    set buffer(value: Uint8Array<ArrayBufferLike>);
    get position(): number;
    set position(value: number);
    constructor(arg?: number | Uint8Array);
    size(): number;
    reallocate(): void;
    shrink(): Uint8Array<ArrayBufferLike>;
    put(b: number | boolean): void;
    get(_index?: number | null): number | undefined;
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
//# sourceMappingURL=byte-buffer.d.ts.map