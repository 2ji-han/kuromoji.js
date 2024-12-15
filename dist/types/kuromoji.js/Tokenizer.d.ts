import type DynamicDictionaries from "./dict/DynamicDictionaries";
import { type TOKEN } from "./util/IpadicFormatter";
declare class Tokenizer {
    #private;
    constructor(dic: DynamicDictionaries);
    static splitByPunctuation(input: string): string[];
    tokenize(text: string): TOKEN[];
}
export default Tokenizer;
