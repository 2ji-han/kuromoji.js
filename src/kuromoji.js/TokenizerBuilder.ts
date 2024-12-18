import Tokenizer from "../_core/Tokenizer";
import DictionaryLoader from "./loader/DictionaryLoader";

export type TokenizerBuilderOption = {
    dicPath?: string | undefined;
};

class TokenizerBuilder {
    #loader: DictionaryLoader;

    constructor(option: TokenizerBuilderOption = {}) {
        this.#loader = new DictionaryLoader(option.dicPath);
    }

    build(callback: (err: Error | null, tokenizer: Tokenizer) => void) {
        this.#loader.load((err, dic) => {
            callback(err, new Tokenizer(dic));
        });
    }
}

export default TokenizerBuilder;
