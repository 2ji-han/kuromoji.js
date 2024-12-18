import DictionaryBuilder from "../_core/dict/builder/DictionaryBuilder";
import TokenizerBuilder, { type TokenizerBuilderOption } from "./TokenizerBuilder";
export { TokenizerBuilder, type TokenizerBuilderOption, DictionaryBuilder };
declare const _default: {
    builder: (option?: TokenizerBuilderOption) => TokenizerBuilder;
    dictionaryBuilder: () => DictionaryBuilder;
};
export default _default;
