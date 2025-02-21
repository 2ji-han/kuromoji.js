import type { CharacterClass } from "../character-class.js";
import { CharacterDefinition } from "../character-definition.js";
export declare class CharacterDefinitionBuilder {
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
//# sourceMappingURL=character-definition-builder.d.ts.map