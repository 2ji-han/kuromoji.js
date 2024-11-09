

import TokenizerBuilder, { type TokenizerBuilderOption } from "./TokenizerBuilder";
import DictionaryBuilder from "./dict/builder/DictionaryBuilder";

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
