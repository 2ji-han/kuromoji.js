import { CharacterDefinition } from "./character-definition.js";
import { TokenInfoDictionary } from "./token-info-dictionary.js";
export declare class UnknownDictionary extends TokenInfoDictionary {
    #private;
    get character_definition(): CharacterDefinition | null;
    characterDefinition(character_definition: CharacterDefinition): this;
    lookup(ch: string): import("./character-class.js").CharacterClass;
    lookupCompatibleCategory(ch: string): import("./character-class.js").CharacterClass[];
    loadUnknownDictionaries(unk_buffer: Uint8Array, unk_pos_buffer: Uint8Array, unk_map_buffer: Uint8Array, cat_map_buffer: Uint8Array, compat_cat_map_buffer: Uint32Array, invoke_def_buffer: Uint8Array): void;
}
//# sourceMappingURL=unknown-dictionary.d.ts.map