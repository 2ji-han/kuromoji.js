import CharacterDefinition from "./CharacterDefinition";
import TokenInfoDictionary from "./TokenInfoDictionary";
declare class UnknownDictionary extends TokenInfoDictionary {
    #private;
    characterDefinition(character_definition: CharacterDefinition): this;
    lookup(ch: string): import("./CharacterClass").default;
    lookupCompatibleCategory(ch: string): import("./CharacterClass").default[];
    loadUnknownDictionaries(unk_buffer: Uint8Array, unk_pos_buffer: Uint8Array, unk_map_buffer: Uint8Array, cat_map_buffer: Uint8Array, compat_cat_map_buffer: Uint32Array, invoke_def_buffer: Uint8Array): void;
}
export default UnknownDictionary;
