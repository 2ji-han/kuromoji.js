

import Tokenizer from "./Tokenizer";
import DictionaryLoader from "./loader/NodeDictionaryLoader";

export type TokenizerBuilderOption = {
    dicPath?: string | undefined;
};

class TokenizerBuilder {
    dic_path: string;

    constructor(option: TokenizerBuilderOption = {}) {
        if (option.dicPath == undefined) {
            this.dic_path = "dict/";
        } else {
            this.dic_path = option.dicPath;
        }
    }

    build(callback: (err: Error[] | null, tokenizer: Tokenizer) => void) {
        const loader = new DictionaryLoader(this.dic_path);
        loader.load((err, dic) => {
            callback(err, new Tokenizer(dic));
        });
    }
}

export default TokenizerBuilder;
