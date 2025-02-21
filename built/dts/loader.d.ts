import { DynamicDictionaries } from "./dict/dynamic-dictionaries.js";
export interface DictionaryLoader {
    load(): Promise<DynamicDictionaries>;
}
export declare class GZipDictionaryLoader implements DictionaryLoader {
    #private;
    private constructor();
    static fromURL(url: string | URL): Promise<DynamicDictionaries>;
    load(): Promise<DynamicDictionaries>;
}
//# sourceMappingURL=loader.d.ts.map