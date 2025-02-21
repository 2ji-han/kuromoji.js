import { CharacterDefinition } from "../character-definition.js";
import { InvokeDefinitionMap } from "../invoke-definition-map.js";
const CATEGORY_DEF_PATTERN = /^(\w+)\s+(\d)\s+(\d)\s+(\d)/;
const CATEGORY_MAPPING_PATTERN = /^(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/;
const RANGE_CATEGORY_MAPPING_PATTERN = /^(0x[0-9A-F]{4})\.\.(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/;
export class CharacterDefinitionBuilder {
    char_def;
    character_category_definition;
    category_mapping;
    /**
     * CharacterDefinitionBuilder
     * @constructor
     */
    constructor() {
        this.char_def = new CharacterDefinition();
        this.char_def.invoke_definition_map = new InvokeDefinitionMap();
        this.character_category_definition = [];
        this.category_mapping = [];
    }
    putLine(line) {
        const parsed_category_def = CATEGORY_DEF_PATTERN.exec(line);
        if (parsed_category_def != null) {
            const class_id = this.character_category_definition.length;
            const char_class = CharacterDefinition.parseCharCategory(class_id, parsed_category_def);
            if (char_class == null) {
                return;
            }
            this.character_category_definition.push(char_class);
            return;
        }
        const parsed_category_mapping = CATEGORY_MAPPING_PATTERN.exec(line);
        if (parsed_category_mapping != null) {
            const mapping = CharacterDefinition.parseCategoryMapping(parsed_category_mapping);
            this.category_mapping.push(mapping);
        }
        const parsed_range_category_mapping = RANGE_CATEGORY_MAPPING_PATTERN.exec(line);
        if (parsed_range_category_mapping != null) {
            const range_mapping = CharacterDefinition.parseRangeCategoryMapping(parsed_range_category_mapping);
            this.category_mapping.push(range_mapping);
        }
    }
    build() {
        // TODO If DEFAULT category does not exist, throw error
        if (!this.char_def || !this.char_def.invoke_definition_map) {
            throw new Error("No data to build.");
        }
        this.char_def.invoke_definition_map.init(this.character_category_definition);
        this.char_def.initCategoryMappings(this.category_mapping);
        return this.char_def;
    }
}
//# sourceMappingURL=character-definition-builder.js.map