import doublearray, { DoubleArray } from "../../util/double-array.js";
import { DynamicDictionaries } from "../dynamic-dictionaries.js";
import { TokenInfoDictionary } from "../token-info-dictionary.js";
import { UnknownDictionary } from "../unknown-dictionary.js";
import { CharacterDefinitionBuilder } from "./character-definition-builder.js";
import { ConnectionCostsBuilder } from "./connection-costs-builder.js";

class DictionaryBuilder {
    #tid_entries: string[][];
    #unk_entries: string[][];
    #cc_builder: ConnectionCostsBuilder;
    #cd_builder: CharacterDefinitionBuilder;
    /**
     * Build dictionaries (token info, connection costs)
     *
     * Generates from matrix.def
     * cc.dat: Connection costs
     *
     * Generates from *.csv
     * dat.dat: Double array
     * tid.dat: Token info dictionary
     * tid_map.dat: targetMap
     * tid_pos.dat: posList (part of speech)
     */
    constructor() {
        // Array of entries, each entry in Mecab form
        // (0: surface form, 1: left id, 2: right id, 3: word cost, 4: part of speech id, 5-: other features)
        this.#tid_entries = [];
        this.#unk_entries = [];
        this.#cc_builder = new ConnectionCostsBuilder();
        this.#cd_builder = new CharacterDefinitionBuilder();
    }

    addTokenInfoDictionary(line: string) {
        const new_entry = line.split(",");
        this.#tid_entries.push(new_entry);
        return this;
    }

    /**
     * Put one line of "matrix.def" file for building ConnectionCosts object
     * @param {string} line is a line of "matrix.def"
     */
    putCostMatrixLine(line: string) {
        this.#cc_builder.putLine(line);
        return this;
    }

    putCharDefLine(line: string) {
        this.#cd_builder.putLine(line);
        return this;
    }

    /**
     * Put one line of "unk.def" file for building UnknownDictionary object
     * @param {string} line is a line of "unk.def"
     */
    putUnkDefLine(line: string) {
        this.#unk_entries.push(line.split(","));
        return this;
    }

    build() {
        const dictionaries = this.buildTokenInfoDictionary();
        const unknown_dictionary = this.buildUnknownDictionary();

        return new DynamicDictionaries(
            dictionaries.trie,
            dictionaries.token_info_dictionary,
            this.#cc_builder.build(),
            unknown_dictionary
        );
    }

    /**
     * Build TokenInfoDictionary
     *
     * @returns {{trie: *, token_info_dictionary: *}}
     */
    buildTokenInfoDictionary(): { trie: any; token_info_dictionary: any; } {
        const token_info_dictionary = new TokenInfoDictionary();
        // using as hashmap, string -> string (word_id -> surface_form) to build dictionary
        const dictionary_entries = token_info_dictionary.buildDictionary(this.#tid_entries);
        const trie = this.buildDoubleArray();
        for (const token_info_id_str in dictionary_entries) {
            const token_info_id = Number.parseInt(token_info_id_str);
            const surface_form = dictionary_entries[token_info_id];
            if (surface_form === undefined) {
                throw new Error(`surface_form for token_info_id ${token_info_id} is undefined`);
            }
            const trie_id = trie.lookup(surface_form);
            token_info_dictionary.addMapping(trie_id, token_info_id);
        }
        return {
            trie: trie,
            token_info_dictionary: token_info_dictionary,
        };
    }

    buildUnknownDictionary() {
        const unk_dictionary = new UnknownDictionary();
        // using as hashmap, string -> string (word_id -> surface_form) to build dictionary
        const dictionary_entries = unk_dictionary.buildDictionary(this.#unk_entries);
        const char_def = this.#cd_builder.build(); // Create CharacterDefinition
        if (char_def.invoke_definition_map == null) {
            throw new Error("invoke_definition_map is null");
        }
        unk_dictionary.characterDefinition(char_def);
        for (const token_info_id_str in dictionary_entries) {
            const token_info_id = Number(token_info_id_str);
            const class_name = dictionary_entries[token_info_id];
            if (class_name === undefined) {
                throw new Error(`class_name for token_info_id ${token_info_id} is undefined`);
            }
            const class_id = char_def.invoke_definition_map.lookup(class_name);
            if (class_id !== null) {
                unk_dictionary.addMapping(class_id, token_info_id);
            } else {
                console.warn("Not found class name: " + class_name);
            }
        }

        return unk_dictionary;
    }

    /**
     * Build double array trie
     *
     * @returns {DoubleArray} Double-Array trie
     */
    buildDoubleArray(): DoubleArray {
        let trie_id = 0;
        const words = this.#tid_entries.map((entry) => {
            const surface_form = entry[0];
            if (surface_form === undefined) {
                throw new Error(`surface_form is undefined in entry: ${entry}`);
            }
            return { k: surface_form, v: trie_id++ };
        });

        const builder = doublearray.builder(1024 * 1024);
        return builder.build(words);
    }
}

export default DictionaryBuilder;
