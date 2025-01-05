import DictionaryBuilder from "../kuromoji-core/dict/builder/DictionaryBuilder";
import TokenizerBuilder, { type TokenizerBuilderOptions } from "./TokenizerBuilder";

export { TokenizerBuilder, type TokenizerBuilderOptions, DictionaryBuilder };

// Public methods
export default {
    builder: (option?: TokenizerBuilderOptions) => {
        return new TokenizerBuilder(option);
    },
    dictionaryBuilder: () => {
        return new DictionaryBuilder();
    },
};
