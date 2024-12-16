import ByteBuffer from "../util/ByteBuffer";
declare class TokenInfoDictionary {
    dictionary: ByteBuffer;
    target_map: Map<number, number[]>;
    pos_buffer: ByteBuffer;
    constructor();
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
export default TokenInfoDictionary;
