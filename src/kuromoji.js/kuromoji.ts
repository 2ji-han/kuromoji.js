import DictionaryBuilder from "../_core/dict/builder/DictionaryBuilder";
import TokenizerBuilder, { type TokenizerBuilderOption } from "./TokenizerBuilder";

export { TokenizerBuilder, type TokenizerBuilderOption, DictionaryBuilder };

// Public methods
export default {
    builder: (option: TokenizerBuilderOption = {}) => {
        return new TokenizerBuilder(option);
    },
    dictionaryBuilder: () => {
        return new DictionaryBuilder();
    },
};
