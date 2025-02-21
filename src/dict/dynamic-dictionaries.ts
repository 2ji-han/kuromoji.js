import doublearray, { type DoubleArray } from "../util/double-array.js";
import { ConnectionCosts } from "./connection-costs.js";
import { TokenInfoDictionary } from "./token-info-dictionary.js";
import { UnknownDictionary } from "./unknown-dictionary.js";

export class DynamicDictionaries {
    trie: DoubleArray;
    token_info_dictionary: TokenInfoDictionary;
    connection_costs: ConnectionCosts;
    unknown_dictionary: UnknownDictionary;
    constructor(
        trie?: DoubleArray,
        token_info_dictionary?: TokenInfoDictionary,
        connection_costs?: ConnectionCosts,
        unknown_dictionary?: UnknownDictionary
    ) {
        this.trie = trie ?? doublearray.builder(0).build([{ k: "", v: 1 }]);
        this.token_info_dictionary = token_info_dictionary ?? new TokenInfoDictionary();
        // backward_size * backward_size
        this.connection_costs = connection_costs ?? new ConnectionCosts(0, 0);
        this.unknown_dictionary = unknown_dictionary ?? new UnknownDictionary();
    }

    loadTrie(base_buffer: Int32Array, check_buffer: Int32Array) {
        this.trie = doublearray.load(base_buffer, check_buffer);
        return this;
    }

    loadTokenInfoDictionaries(token_info_buffer: Uint8Array, pos_buffer: Uint8Array, target_map_buffer: Uint8Array) {
        this.token_info_dictionary.loadDictionary(token_info_buffer);
        this.token_info_dictionary.loadPosVector(pos_buffer);
        this.token_info_dictionary.loadTargetMap(target_map_buffer);
        return this;
    }

    loadConnectionCosts(cc_buffer: Int16Array) {
        this.connection_costs.loadConnectionCosts(cc_buffer);
        return this;
    }

    loadUnknownDictionaries(
        unk_buffer: Uint8Array,
        unk_pos_buffer: Uint8Array,
        unk_map_buffer: Uint8Array,
        cat_map_buffer: Uint8Array,
        compat_cat_map_buffer: Uint32Array,
        invoke_def_buffer: Uint8Array
    ) {
        this.unknown_dictionary.loadUnknownDictionaries(
            unk_buffer,
            unk_pos_buffer,
            unk_map_buffer,
            cat_map_buffer,
            compat_cat_map_buffer,
            invoke_def_buffer
        );
        return this;
    }
}
