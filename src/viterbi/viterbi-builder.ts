import type { DoubleArray } from "../double-array.js";
import type { DynamicDictionaries } from "../dict/dynamic-dictionaries.js";
import type { TokenInfoDictionary } from "../dict/token-info-dictionary.js";
import type { UnknownDictionary } from "../dict/unknown-dictionary.js";
import { SurrogateAwareString } from "../util/surrogate-aware-string.js";
import { ViterbiLattice } from "./viterbi-lattice.js";
import { ViterbiNode } from "./viterbi-node.js";

export class ViterbiBuilder {
    #trie: DoubleArray;
    #token_info_dictionary: TokenInfoDictionary;
    #unknown_dictionary: UnknownDictionary;
    /**
     * ViterbiBuilder builds word lattice (ViterbiLattice)
     * @param {DynamicDictionaries} dic dictionary
     * @constructor
     */
    constructor(dic: DynamicDictionaries) {
        this.#trie = dic.trie;
        this.#token_info_dictionary = dic.token_info_dictionary;
        this.#unknown_dictionary = dic.unknown_dictionary;
    }

    /**
     * Build word lattice
     * @param {string} sentence_str Input text
     * @returns {ViterbiLattice} Word lattice
     */
    build(sentence_str: string): ViterbiLattice {
        const lattice = new ViterbiLattice();
        const sentence = new SurrogateAwareString(sentence_str);
        const sentence_length = sentence.length;
        for (let pos = 0; pos < sentence_length; pos++) {
            const tail = sentence.slice(pos);
            const vocabulary = this.#trie.commonPrefixSearch(tail);
            for (const { k: key, v: trie_id } of vocabulary) {
                const token_info_ids = this.#token_info_dictionary.target_map[trie_id];
                if (!token_info_ids) throw new Error("TokenInfo dictionary is broken");
                for (const token_info_id of token_info_ids) {
                    const left_id = this.#token_info_dictionary.dictionary.getShort(token_info_id);
                    const right_id = this.#token_info_dictionary.dictionary.getShort(token_info_id + 2);
                    const word_cost = this.#token_info_dictionary.dictionary.getShort(token_info_id + 4);
                    // node_name, cost, start_index, length, type, left_id, right_id, surface_form
                    lattice.append(
                        new ViterbiNode(token_info_id, word_cost, pos + 1, key.length, "KNOWN", left_id, right_id, key)
                    );
                }
            }

            const head_char = tail.charAt(0);
            const head_char_class = this.#unknown_dictionary.lookup(head_char);
            if (!vocabulary?.length || head_char_class.is_always_invoke) {
                let key = head_char;
                const tail_length = tail.length;
                if (head_char_class.is_grouping && tail_length > 1) {
                    const class_name = head_char_class.class_name;
                    for (let k = 1; k < tail_length; k++) {
                        const next_char = tail.charAt(k);
                        if (this.#unknown_dictionary.lookup(next_char).class_name !== class_name) {
                            break;
                        }
                        key += next_char;
                    }
                }
                const unk_ids = this.#unknown_dictionary.target_map[head_char_class.class_id];
                if (!unk_ids) throw new Error("Unknown dictionary is broken");
                const unknown_dict = this.#unknown_dictionary.dictionary;
                for (const unk_id of unk_ids) {
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
