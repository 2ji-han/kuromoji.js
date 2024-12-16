import Tokenizer from "./Tokenizer";
import DictionaryLoader from "./loader/DictionaryLoader";

export type TokenizerBuilderOption = {
    dicPath?: string | undefined;
};

class TokenizerBuilder {
    #loader: DictionaryLoader;

    constructor(option: TokenizerBuilderOption = {}) {
        this.#loader = new DictionaryLoader(option.dicPath);
    }

    async build(): Promise<Tokenizer> {
        const dictionary = await this.#loader.load();
        return new Tokenizer(dictionary);
    }
}

export default TokenizerBuilder;
