

import ViterbiNode from "./ViterbiNode";
import ViterbiLattice from "./ViterbiLattice";
import SurrogateAwareString from "../util/SurrogateAwareString";
import type DynamicDictionaries from "../dict/DynamicDictionaries";
import type { DoubleArray } from "../util/DoubleArray";
import type TokenInfoDictionary from "../dict/TokenInfoDictionary";
import type UnknownDictionary from "../dict/UnknownDictionary";

class ViterbiBuilder {
    trie: DoubleArray;
    token_info_dictionary: TokenInfoDictionary;
    unknown_dictionary: UnknownDictionary;
    /**
     * ViterbiBuilder builds word lattice (ViterbiLattice)
     * @param {DynamicDictionaries} dic dictionary
     * @constructor
     */
    constructor(dic: DynamicDictionaries) {
        this.trie = dic.trie;
        this.token_info_dictionary = dic.token_info_dictionary;
        this.unknown_dictionary = dic.unknown_dictionary;
    }

    /**
     * Build word lattice
     * @param {string} sentence_str Input text
     * @returns {ViterbiLattice} Word lattice
     */
    build(sentence_str: string) {
        const lattice = new ViterbiLattice();
        const sentence = new SurrogateAwareString(sentence_str);
        const sentence_length = sentence.length;
        for (let pos = 0; pos < sentence_length; pos++) {
            const tail = sentence.slice(pos);
            const vocabulary = this.trie.commonPrefixSearch(tail);
            const vocabulary_length = vocabulary.length;
            for (let n = 0; n < vocabulary_length; n++) {
                // Words in dictionary do not have surrogate pair (only UCS2 set)
                const trie_id = vocabulary[n].v;
                const key = vocabulary[n].k;
                const token_info_ids = this.token_info_dictionary.target_map[trie_id];
                const tokenInfoIds_length = token_info_ids.length;
                for (let j = 0; j < tokenInfoIds_length; j++) {
                    const token_info_id = token_info_ids[j];
                    const left_id = this.token_info_dictionary.dictionary.getShort(token_info_id);
                    const right_id = this.token_info_dictionary.dictionary.getShort(token_info_id + 2);
                    const word_cost = this.token_info_dictionary.dictionary.getShort(token_info_id + 4);
                    // node_name, cost, start_index, length, type, left_id, right_id, surface_form
                    lattice.append(
                        new ViterbiNode(token_info_id, word_cost, pos + 1, key.length, "KNOWN", left_id, right_id, key)
                    );
                }
            }

            const head_char = tail.charAt(0);
            const head_char_class = this.unknown_dictionary.lookup(head_char);
            if (!vocabulary?.length || head_char_class.is_always_invoke) {
                let key = head_char;
                const tail_length = tail.length;
                if (head_char_class.is_grouping && tail_length > 1) {
                    const class_name = head_char_class.class_name;
                    for (let k = 1; k < tail_length; k++) {
                        const next_char = tail.charAt(k);
                        if (this.unknown_dictionary.lookup(next_char).class_name !== class_name) {
                            break;
                        }
                        key += next_char;
                    }
                }
                const unk_ids = this.unknown_dictionary.target_map[head_char_class.class_id];
                if (!unk_ids) throw new Error("Unknown dictionary is broken");
                const unk_length = unk_ids.length;
                const unknown_dict = this.unknown_dictionary.dictionary;
                for (let j = 0; j < unk_length; j++) {
                    const unk_id = unk_ids[j];
                    lattice.append(
                        new ViterbiNode(
                            unk_id,
                            unknown_dict.getShort(unk_id + 4),
                            pos + 1,
                            key.length,
                            "UNKNOWN",
                            unknown_dict.getShort(unk_id),
                            unknown_dict.getShort(unk_id + 2),
                            key
                        )
                    );
                }
            }
        }

        lattice.appendEos();

        return lattice;
    }
}

export default ViterbiBuilder;
