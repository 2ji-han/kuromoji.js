import type CharacterClass from "../CharacterClass";
import CharacterDefinition from "../CharacterDefinition";
declare class CharacterDefinitionBuilder {
    char_def: CharacterDefinition;
    character_category_definition: CharacterClass[];
    category_mapping: {
        start: number;
        default: string;
        compatible: string[];
        end?: number;
    }[];
    /**
     * CharacterDefinitionBuilder
     * @constructor
     */
    constructor();
    putLine(line: string): void;
    build(): CharacterDefinition;
}
export default CharacterDefinitionBuilder;
