import { type DoubleArray } from "../double-array.js";
import { ConnectionCosts } from "./connection-costs.js";
import { TokenInfoDictionary } from "./token-info-dictionary.js";
import { UnknownDictionary } from "./unknown-dictionary.js";
export declare class DynamicDictionaries {
    trie: DoubleArray;
    token_info_dictionary: TokenInfoDictionary;
    connection_costs: ConnectionCosts;
    unknown_dictionary: UnknownDictionary;
    constructor(trie?: DoubleArray, token_info_dictionary?: TokenInfoDictionary, connection_costs?: ConnectionCosts, unknown_dictionary?: UnknownDictionary);
    loadTrie(base_buffer: Int32Array, check_buffer: Int32Array): this;
    loadTokenInfoDictionaries(token_info_buffer: Uint8Array, pos_buffer: Uint8Array, target_map_buffer: Uint8Array): this;
    loadConnectionCosts(cc_buffer: Int16Array): this;
    loadUnknownDictionaries(unk_buffer: Uint8Array, unk_pos_buffer: Uint8Array, unk_map_buffer: Uint8Array, cat_map_buffer: Uint8Array, compat_cat_map_buffer: Uint32Array, invoke_def_buffer: Uint8Array): this;
}
//# sourceMappingURL=dynamic-dictionaries.d.ts.map