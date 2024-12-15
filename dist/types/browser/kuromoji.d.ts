import TokenizerBuilder, { type TokenizerBuilderOption } from "./TokenizerBuilder";
import DictionaryBuilder from "./dict/builder/DictionaryBuilder";
export { TokenizerBuilder, type TokenizerBuilderOption, DictionaryBuilder };
declare const _default: {
    builder: (option?: TokenizerBuilderOption) => TokenizerBuilder;
    dictionaryBuilder: () => DictionaryBuilder;
};
export default _default;
