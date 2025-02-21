import DictionaryBuilder from "./dict/builder/dictionary-builder.js";
export { DictionaryBuilder };
import { Tokenizer } from "./tokenizer.js";
import { GZipDictionaryLoader } from "./loader.js";
// Public methods
export default {
    async fromURL(url) {
        const dicPath = typeof url === "string" ? new URL(url) : url;
        const dictionary = await GZipDictionaryLoader.fromURL(dicPath);
        return new Tokenizer(dictionary);
    },
    async fromLoader(loader) {
        const dictionary = await loader.load();
        return new Tokenizer(dictionary);
    },
    async fromDictionary(dictionary) {
        return new Tokenizer(dictionary);
    },
};
`
import kuromoji from "@f1w3/kuromoji.js";
const tokenizer = await kurmoji.fromURL("https://coco-ly.com/kuromoji.js/dict");
const tokens = tokenizer.tokenize("すもももももももものうち");
console.log(tokens);
`;
//# sourceMappingURL=index.js.map