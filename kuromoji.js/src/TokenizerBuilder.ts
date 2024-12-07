import Tokenizer from "./Tokenizer";
import DictionaryLoader from "./loader/DictionaryLoader";

export type TokenizerBuilderOption = {
    dicPath?: string | undefined;
};

class TokenizerBuilder {
    #dic_path: string | undefined;

    constructor(option: TokenizerBuilderOption = {}) {
        this.#dic_path = option.dicPath;
    }

    build(callback: (err: Error[] | null, tokenizer: Tokenizer) => void) {
        const loader = new DictionaryLoader(this.#dic_path);
        loader.load((err, dic) => {
            callback(err, new Tokenizer(dic));
        });
    }
}

export default TokenizerBuilder;
