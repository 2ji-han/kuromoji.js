import DictionaryBuilder from "./dict/builder/dictionary-builder.js";
export { DictionaryBuilder };
import { Tokenizer } from "./tokenizer.js";
import { type DictionaryLoader, GZipDictionaryLoader } from "./loader.js";
import type { DynamicDictionaries } from "./dict/dynamic-dictionaries.js";

export type TokenizerBuilderOptions = {
    dicPath: URL | string;
};

// Public methods
export default {
    async fromURL(url: string | URL): Promise<Tokenizer> {
        const dictionary = await GZipDictionaryLoader.fromURL(url);
        return new Tokenizer(dictionary);
    },

    async fromLoader(loader: DictionaryLoader): Promise<Tokenizer> {
        const dictionary = await loader.load();
        return new Tokenizer(dictionary);
    },

    async fromDictionary(dictionary: DynamicDictionaries): Promise<Tokenizer> {
        return new Tokenizer(dictionary);
    },
};

/*

import kuromoji from "@2ji-han/kuromoji.js";
const tokenizer = await kurmoji.fromURL("https://coco-ly.com/kuromoji.js/dict");
const tokens = tokenizer.tokenize("すもももももももものうち");
console.log(tokens);

*/