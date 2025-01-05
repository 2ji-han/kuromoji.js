import CharacterDefinition from "./CharacterDefinition";
import TokenInfoDictionary from "./TokenInfoDictionary";

class UnknownDictionary extends TokenInfoDictionary {
    #character_definition: CharacterDefinition | null = null;

    get character_definition() {
        return this.#character_definition;
    }

    characterDefinition(character_definition: CharacterDefinition) {
        this.#character_definition = character_definition;
        return this;
    }

    lookup(ch: string) {
        if (this.#character_definition == null) {
            throw new Error("CharacterDefinition is not set");
        }
        return this.#character_definition.lookup(ch);
    }

    lookupCompatibleCategory(ch: string) {
        if (this.#character_definition == null) {
            throw new Error("CharacterDefinition is not set");
        }
        return this.#character_definition.lookupCompatibleCategory(ch);
    }

    loadUnknownDictionaries(
        unk_buffer: Uint8Array,
        unk_pos_buffer: Uint8Array,
        unk_map_buffer: Uint8Array,
        cat_map_buffer: Uint8Array,
        compat_cat_map_buffer: Uint32Array,
        invoke_def_buffer: Uint8Array
    ) {
        this.loadDictionary(unk_buffer);
        this.loadPosVector(unk_pos_buffer);
        this.loadTargetMap(unk_map_buffer);
        this.#character_definition = new CharacterDefinition().load(
            cat_map_buffer,
            compat_cat_map_buffer,
            invoke_def_buffer
        );
    }
}

export default UnknownDictionary;
