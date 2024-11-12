import ByteBuffer from "../util/ByteBuffer";
import CharacterClass from "./CharacterClass";

/**
 * InvokeDefinitionMap represents invoke definition a part of char.def
 * @constructor
 */
class InvokeDefinitionMap {
    map: CharacterClass[];
    lookup_table: Map<string, number>;
    constructor() {
        this.map = [];
        this.lookup_table = new Map<string, number>(); // Just for building dictionary
    }

    /**
     * Load InvokeDefinitionMap from buffer
     * @param {Uint8Array} invoke_def_buffer
     * @returns {InvokeDefinitionMap}
     */
    static load(invoke_def_buffer: Uint8Array): InvokeDefinitionMap {
        const invoke_def = new InvokeDefinitionMap();
        const character_category_definition: CharacterClass[] = [];

        const buffer = new ByteBuffer(invoke_def_buffer);
        while (buffer.position + 1 < buffer.size()) {
            const class_id = character_category_definition.length;
            const is_always_invoke = Boolean(buffer.get());
            const is_grouping = Boolean(buffer.get());
            const max_length = buffer.getInt();
            const class_name = buffer.getString();
            character_category_definition.push(
                new CharacterClass(class_id, class_name, is_always_invoke, is_grouping, max_length)
            );
        }

        invoke_def.init(character_category_definition);

        return invoke_def;
    }

    /**
     * Initializing method
     * @param {Array.<CharacterClass>} character_category_definition Array of CharacterClass
     */
    init(character_category_definition: CharacterClass[]) {
        if (character_category_definition == null) {
            return;
        }
        const ccd_length = character_category_definition.length;
        for (let i = 0; i < ccd_length; i++) {
            const character_class = character_category_definition[i];
            this.map[i] = character_class;
            this.lookup_table.set(character_class.class_name, i);
        }
    }

    /**
     * Get class information by class ID
     * @param {number} class_id
     * @returns {CharacterClass}
     */
    getCharacterClass(class_id: number) {
        return this.map[class_id];
    }

    /**
     * For building character definition dictionary
     * @param {string} class_name character
     * @returns {number} class_id
     */
    lookup(class_name: string): number | null {
        const class_id = this.lookup_table.get(class_name);
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
        for (let i = 0; i < this.map.length; i++) {
            const char_class = this.map[i];
            buffer.put(char_class.is_always_invoke);
            buffer.put(char_class.is_grouping);
            buffer.putInt(char_class.max_length);
            buffer.putString(char_class.class_name);
        }
        buffer.shrink();
        return buffer.buffer;
    }
}

export default InvokeDefinitionMap;
