import Tokenizer from "../kuromoji-core/Tokenizer";
import DictionaryLoader from "./loader/DictionaryLoader";

export type TokenizerBuilderConfig = {
    dicPath: string;
};

export type TokenizerBuilderOptions = TokenizerBuilderConfig | string | undefined;

class TokenizerBuilder {
    #loader: DictionaryLoader;

    constructor(_option: TokenizerBuilderOptions) {
        let option: string;
        if (_option === undefined) {
            option = "./node_modules/kuromoji.js/dict";
        } else if (typeof _option === "string") {
            option = _option;
        } else {
            option = _option.dicPath;
        }
        this.#loader = new DictionaryLoader(option);
    }

    async build(): Promise<Tokenizer> {
        const dictionary = await this.#loader.load();
        return new Tokenizer(dictionary);
    }
}

export default TokenizerBuilder;
