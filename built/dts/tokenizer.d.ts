import type { DynamicDictionaries } from "./dict/dynamic-dictionaries.js";
import { type TOKEN } from "./util/ipadic-formatter.js";
export declare class Tokenizer {
    #private;
    constructor(dic: DynamicDictionaries);
    tokenize(text: string): TOKEN[];
}
//# sourceMappingURL=tokenizer.d.ts.map