/**
 * Mappings between IPADIC dictionary features and tokenized results
 * @constructor
 */
export class IpadicFormatter {
    formatEntry(word_id, position, type, features) {
        if (features.length < 10) {
            throw new Error(`Invalid TokenInfoDictionary entry: ${features}`);
        }
        return {
            word_id: word_id,
            word_type: type,
            word_position: position,
            surface_form: features[0],
            pos: features[1],
            pos_detail_1: features[2],
            pos_detail_2: features[3],
            pos_detail_3: features[4],
            conjugated_type: features[5],
            conjugated_form: features[6],
            basic_form: features[7],
            reading: features[8],
            pronunciation: features[9],
        };
    }
    formatUnknownEntry(word_id, position, type, features, surface_form) {
        if (features.length < 8) {
            throw new Error(`Invalid UnknownDictionary entry: ${features}`);
        }
        return {
            word_id: word_id,
            word_type: type,
            word_position: position,
            surface_form: surface_form,
            pos: features[1],
            pos_detail_1: features[2],
            pos_detail_2: features[3],
            pos_detail_3: features[4],
            conjugated_type: features[5],
            conjugated_form: features[6],
            basic_form: features[7],
        };
    }
}
//# sourceMappingURL=ipadic-formatter.js.map