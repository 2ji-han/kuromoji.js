import { CharacterClass } from "./character-class.js";
/**
 * InvokeDefinitionMap represents invoke definition a part of char.def
 * @constructor
 */
export declare class InvokeDefinitionMap {
    #private;
    constructor();
    /**
     * Load InvokeDefinitionMap from buffer
     * @param {Uint8Array} invoke_def_buffer
     * @returns {InvokeDefinitionMap}
     */
    static load(invoke_def_buffer: Uint8Array): InvokeDefinitionMap;
    /**
     * Initializing method
     * @param {Array.<CharacterClass>} character_category_definition Array of CharacterClass
     */
    init(character_category_definition: CharacterClass[]): void;
    /**
     * Get class information by class ID
     * @param {number} class_id
     * @returns {CharacterClass}
     */
    getCharacterClass(class_id: number): CharacterClass;
    /**
     * For building character definition dictionary
     * @param {string} class_name character
     * @returns {number} class_id
     */
    lookup(class_name: string): number | null;
    /**
     * Transform from map to binary buffer
     * @returns {Uint8Array}
     */
    toBuffer(): Uint8Array;
}
//# sourceMappingURL=invoke-definition-map.d.ts.map