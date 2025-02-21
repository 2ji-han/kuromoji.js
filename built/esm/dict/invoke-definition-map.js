import { ByteBuffer } from "../util/byte-buffer.js";
import { CharacterClass } from "./character-class.js";
/**
 * InvokeDefinitionMap represents invoke definition a part of char.def
 * @constructor
 */
export class InvokeDefinitionMap {
    #map;
    #lookup_table;
    constructor() {
        this.#map = [];
        this.#lookup_table = new Map(); // Just for building dictionary
    }
    /**
     * Load InvokeDefinitionMap from buffer
     * @param {Uint8Array} invoke_def_buffer
     * @returns {InvokeDefinitionMap}
     */
    static load(invoke_def_buffer) {
        const invoke_def = new InvokeDefinitionMap();
        const character_category_definition = [];
        const buffer = new ByteBuffer(invoke_def_buffer);
        while (buffer.position + 1 < buffer.size()) {
            const class_id = character_category_definition.length;
            const is_always_invoke = buffer.getBool();
            const is_grouping = buffer.getBool();
            const max_length = buffer.getInt();
            const class_name = buffer.getString();
            character_category_definition.push(new CharacterClass(class_id, class_name, is_always_invoke, is_grouping, max_length));
        }
        invoke_def.init(character_category_definition);
        return invoke_def;
    }
    /**
     * Initializing method
     * @param {Array.<CharacterClass>} character_category_definition Array of CharacterClass
     */
    init(character_category_definition) {
        if (character_category_definition == null) {
            return;
        }
        for (const character_class of character_category_definition) {
            this.#map[character_class.class_id] = character_class;
            this.#lookup_table.set(character_class.class_name, character_class.class_id);
        }
    }
    /**
     * Get class information by class ID
     * @param {number} class_id
     * @returns {CharacterClass}
     */
    getCharacterClass(class_id) {
        if (class_id < 0 || class_id >= this.#map.length || this.#map[class_id] == null) {
            throw new Error(`Invalid class ID: ${class_id}`);
        }
        return this.#map[class_id];
    }
    /**
     * For building character definition dictionary
     * @param {string} class_name character
     * @returns {number} class_id
     */
    lookup(class_name) {
        const class_id = this.#lookup_table.get(class_name);
        if (class_id == null) {
            return null;
        }
        return class_id;
    }
    /**
     * Transform from map to binary buffer
     * @returns {Uint8Array}
     */
    toBuffer() {
        const buffer = new ByteBuffer();
        for (const char_class of this.#map) {
            buffer.put(char_class.is_always_invoke);
            buffer.put(char_class.is_grouping);
            buffer.putInt(char_class.max_length);
            buffer.putString(char_class.class_name);
        }
        buffer.shrink();
        return buffer.buffer;
    }
}
//# sourceMappingURL=invoke-definition-map.js.map