import DictionaryBuilder from "./dict/builder/dictionary-builder.js";
export { DictionaryBuilder };
import { Tokenizer } from "./tokenizer.js";
import { DictionaryLoader } from "./loader.js";
import { DynamicDictionaries } from "./dict/dynamic-dictionaries.js";
export type TokenizerBuilderOptions = {
    dicPath: URL | string;
};
declare const _default: {
    fromURL(url: string | URL): Promise<Tokenizer>;
    fromLoader(loader: DictionaryLoader): Promise<Tokenizer>;
    fromDictionary(dictionary: DynamicDictionaries): Promise<Tokenizer>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map