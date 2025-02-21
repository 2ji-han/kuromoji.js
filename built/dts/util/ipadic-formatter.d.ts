import type { WORD_TYPE } from "../viterbi/viterbi-node.js";
export type TOKEN = {
    word_id: number;
    word_type: WORD_TYPE;
    word_position: number;
    surface_form: string | Uint8Array;
    pos: string;
    pos_detail_1: string;
    pos_detail_2: string;
    pos_detail_3: string;
    conjugated_type: string;
    conjugated_form: string;
    basic_form: string;
    reading?: string;
    pronunciation?: string;
};
/**
 * Mappings between IPADIC dictionary features and tokenized results
 * @constructor
 */
export declare class IpadicFormatter {
    formatEntry(word_id: number, position: number, type: WORD_TYPE, features: string[]): TOKEN;
    formatUnknownEntry(word_id: number, position: number, type: WORD_TYPE, features: string[], surface_form: string | Uint8Array): TOKEN;
}
//# sourceMappingURL=ipadic-formatter.d.ts.map