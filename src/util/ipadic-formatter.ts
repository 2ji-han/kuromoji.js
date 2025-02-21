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
export class IpadicFormatter {
    formatEntry(word_id: number, position: number, type: WORD_TYPE, features: string[]): TOKEN {
        if (features.length < 10) {
            throw new Error(`Invalid TokenInfoDictionary entry: ${features}`);
        }
        return {
            word_id: word_id,
            word_type: type,
            word_position: position,
            surface_form: features[0]!,
            pos: features[1]!,
            pos_detail_1: features[2]!,
            pos_detail_2: features[3]!,
            pos_detail_3: features[4]!,
            conjugated_type: features[5]!,
            conjugated_form: features[6]!,
            basic_form: features[7]!,
            reading: features[8]!,
            pronunciation: features[9]!,
        };
    }

    formatUnknownEntry(
        word_id: number,
        position: number,
        type: WORD_TYPE,
        features: string[],
        surface_form: string | Uint8Array
    ): TOKEN {
        if (features.length < 8) {
            throw new Error(`Invalid UnknownDictionary entry: ${features}`);
        }
        return {
            word_id: word_id,
            word_type: type,
            word_position: position,
            surface_form: surface_form,
            pos: features[1]!,
            pos_detail_1: features[2]!,
            pos_detail_2: features[3]!,
            pos_detail_3: features[4]!,
            conjugated_type: features[5]!,
            conjugated_form: features[6]!,
            basic_form: features[7]!,
        };
    }
}
