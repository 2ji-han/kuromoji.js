import { SurrogateAwareString } from "../util/surrogate-aware-string.js";
import { CharacterClass } from "./character-class.js";
import { InvokeDefinitionMap } from "./invoke-definition-map.js";
const DEFAULT_CATEGORY = "DEFAULT";
export class CharacterDefinition {
    #_character_category_map;
    #_compatible_category_map;
    #_invoke_definition_map;
    get character_category_map() {
        return this.#_character_category_map;
    }
    set character_category_map(value) {
        this.#_character_category_map = value;
    }
    get compatible_category_map() {
        return this.#_compatible_category_map;
    }
    set compatible_category_map(value) {
        this.#_compatible_category_map = value;
    }
    get invoke_definition_map() {
        return this.#_invoke_definition_map;
    }
    set invoke_definition_map(value) {
        this.#_invoke_definition_map = value;
    }
    /**
     * CharacterDefinition represents char.def file and
     * defines behavior of unknown word processing
     * @constructor
     */
    constructor() {
        this.#_character_category_map = new Uint8Array(65536); // for all UCS2 code points
        this.#_compatible_category_map = new Uint32Array(65536); // for all UCS2 code points
        this.#_invoke_definition_map = null;
    }
    /**
     * Load CharacterDefinition
     * @param {Uint8Array} cat_map_buffer
     * @param {Uint32Array} compat_cat_map_buffer
     * @param {Uint8Array} invoke_def_buffer
     * @returns {CharacterDefinition}
     */
    load(cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
        const char_def = new CharacterDefinition();
        char_def.#_character_category_map = cat_map_buffer;
        char_def.#_compatible_category_map = compat_cat_map_buffer;
        char_def.#_invoke_definition_map = InvokeDefinitionMap.load(invoke_def_buffer);
        return char_def;
    }
    static parseCharCategory(class_id, parsed_category_def) {
        if (parsed_category_def.length < 5) {
            throw new Error(`char.def parse error. Invalid category definition:${parsed_category_def}`);
        }
        const category = parsed_category_def[1];
        const invoke = Number.parseInt(parsed_category_def[2]);
        const grouping = Number.parseInt(parsed_category_def[3]);
        const max_length = Number.parseInt(parsed_category_def[4]);
        if (!Number.isFinite(invoke) || (invoke !== 0 && invoke !== 1)) {
            throw new Error(`char.def parse error. INVOKE is 0 or 1 in:${invoke}`);
        }
        if (!Number.isFinite(grouping) || (grouping !== 0 && grouping !== 1)) {
            throw new Error(`char.def parse error. GROUP is 0 or 1 in:${grouping}`);
        }
        if (!Number.isFinite(max_length) || max_length < 0) {
            throw new Error(`char.def parse error. LENGTH is 1 to n:${max_length}`);
        }
        return new CharacterClass(class_id, category, invoke === 1, grouping === 1, max_length);
    }
    static parseCategoryMapping(parsed_category_mapping) {
        if (parsed_category_mapping.length < 3) {
            throw new Error(`char.def parse error. Invalid category mapping:${parsed_category_mapping}`);
        }
        const start = Number.parseInt(parsed_category_mapping[1]);
        if (!Number.isFinite(start) || start < 0 || start > 0xffff) {
            throw new Error(`char.def parse error. CODE is invalid:${start}`);
        }
        return {
            start: start,
            default: parsed_category_mapping[2],
            compatible: 3 < parsed_category_mapping.length ? parsed_category_mapping.slice(3) : [],
        };
    }
    static parseRangeCategoryMapping(parsed_category_mapping) {
        if (parsed_category_mapping.length < 4) {
            throw new Error(`char.def parse error. Invalid category mapping:${parsed_category_mapping}`);
        }
        const start = Number.parseInt(parsed_category_mapping[1]);
        const end = Number.parseInt(parsed_category_mapping[2]);
        if (!Number.isFinite(start) || start < 0 || start > 0xffff) {
            throw new Error(`char.def parse error. CODE is invalid:${start}`);
        }
        if (!Number.isFinite(end) || end < 0 || end > 0xffff) {
            throw new Error(`char.def parse error. CODE is invalid:${end}`);
        }
        return {
            start: start,
            end: end,
            default: parsed_category_mapping[3],
            compatible: 4 < parsed_category_mapping.length ? parsed_category_mapping.slice(4) : [],
        };
    }
    /**
     * Initializing method
     * @param {Array} category_mapping Array of category mapping
     */
    initCategoryMappings(category_mapping) {
        if (!this.#_invoke_definition_map) {
            throw new Error("CharacterDefinition.initCategoryMappings: #_invoke_definition_map is null");
        }
        // Initialize map by DEFAULT class
        let code_point = 0;
        if (category_mapping != null) {
            for (const mapping of category_mapping) {
                for (code_point = mapping.start; code_point <= (mapping.end || mapping.start); code_point++) {
                    // Default Category class ID
                    const id = this.#_invoke_definition_map.lookup(mapping.default);
                    if (id == null) {
                        throw new Error("CharacterDefinition.initCategoryMappings: #_invoke_definition_map.lookup() returns null");
                    }
                    this.#_character_category_map[code_point] = id;
                    for (const compatible_category of mapping.compatible) {
                        let bitset = this.#_compatible_category_map[code_point];
                        if (bitset === undefined) {
                            throw new Error(`Bitset for code point ${code_point} is undefined`);
                        }
                        const class_id = this.#_invoke_definition_map.lookup(compatible_category); // Default Category
                        if (class_id == null) {
                            continue;
                        }
                        const class_id_bit = 1 << class_id;
                        bitset = bitset | class_id_bit; // Set a bit of class ID 例えば、class_idが3のとき、3ビット目に1を立てる
                        this.#_compatible_category_map[code_point] = bitset;
                    }
                }
            }
        }
        const default_id = this.#_invoke_definition_map.lookup(DEFAULT_CATEGORY);
        if (default_id == null) {
            return;
        }
        const ccm_length = this.#_compatible_category_map.length;
        for (code_point = 0; code_point < ccm_length; code_point++) {
            // 他に何のクラスも定義されていなかったときだけ DEFAULT
            if (this.#_character_category_map[code_point] === 0) {
                // DEFAULT class ID に対応するビットだけ1を立てる
                this.#_character_category_map[code_point] = 1 << default_id;
            }
        }
    }
    /**
     * Lookup compatible categories for a character (not included 1st category)
     * @param {string} ch UCS2 character (just 1st character is effective)
     * @returns {Array.<CharacterClass>} character classes
     */
    lookupCompatibleCategory(ch) {
        const classes = [];
        if (!this.#_invoke_definition_map) {
            throw new Error("CharacterDefinition.lookupCompatibleCategory: #_invoke_definition_map is null");
        }
        /*
        if (SurrogateAwareString.isSurrogatePair(ch)) {
        // Surrogate pair character codes can not be defined by char.def
        return classes;
        }
        */
        const code = ch.charCodeAt(0);
        let integer = null;
        if (code < this.#_compatible_category_map.length) {
            if (this.#_compatible_category_map[code] == null) {
                throw new Error(`CharacterDefinition.lookupCompatibleCategory: Bitset is null for code ${code}`);
            }
            integer = this.#_compatible_category_map[code]; // Bitset
        }
        if (integer == null || integer === 0) {
            return classes;
        }
        for (let bit = 0; bit < 32; bit++) {
            // Treat "bit" as a class ID
            if ((integer << (31 - bit)) >>> 31 === 1) {
                const character_class = this.#_invoke_definition_map.getCharacterClass(bit);
                if (character_class == null) {
                    continue;
                }
                classes.push(character_class);
            }
        }
        return classes;
    }
    /**
     * Lookup category for a character
     * @param {string} ch UCS2 character (just 1st character is effective)
     * @returns {CharacterClass} character class
     */
    lookup(ch) {
        if (!this.#_invoke_definition_map) {
            throw new Error("CharacterDefinition.lookup: #_invoke_definition_map is null");
        }
        let class_id = null;
        const code = ch.charCodeAt(0);
        if (SurrogateAwareString.isSurrogatePair(ch)) {
            // Surrogate pair character codes can not be defined by char.def, so set DEFAULT category
            class_id = this.#_invoke_definition_map.lookup(DEFAULT_CATEGORY);
        }
        else if (code < this.#_character_category_map.length) {
            if (this.#_character_category_map[code] == null) {
                throw new Error(`CharacterDefinition.lookup: class_id is null for code ${code}`);
            }
            class_id = this.#_character_category_map[code]; // Read as integer value
        }
        if (class_id == null) {
            class_id = this.#_invoke_definition_map.lookup(DEFAULT_CATEGORY);
        }
        return this.#_invoke_definition_map.getCharacterClass(class_id);
    }
}
//# sourceMappingURL=character-definition.js.map