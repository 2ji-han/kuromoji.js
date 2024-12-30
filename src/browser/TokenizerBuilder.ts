import Tokenizer from "../_core/Tokenizer";
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

    build(callback: (err: Error | null, tokenizer: Tokenizer) => void) {
        this.#loader.load((err, dic) => {
            callback(err, new Tokenizer(dic));
        });
    }
}

export default TokenizerBuilder;
