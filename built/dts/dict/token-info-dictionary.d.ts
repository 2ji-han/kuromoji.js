import { ByteBuffer } from "../util/byte-buffer.js";
export declare class TokenInfoDictionary {
    #private;
    constructor();
    get dictionary(): ByteBuffer;
    get target_map(): {
        [key: number]: number[];
    };
    get pos_buffer(): ByteBuffer;
    buildDictionary(entries: string[][]): {
        [word_id: number]: string;
    };
    put(left_id: number, right_id: number, word_cost: number, surface_form: string, feature: string): number;
    addMapping(source: number, target: number): void;
    targetMapToBuffer(): Uint8Array;
    loadDictionary(array_buffer: Uint8Array): this;
    loadPosVector(array_buffer: Uint8Array): this;
    loadTargetMap(array_buffer: Uint8Array): this;
    getFeatures(token_info_id: number): string | null;
}
//# sourceMappingURL=token-info-dictionary.d.ts.map