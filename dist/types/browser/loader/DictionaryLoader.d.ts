import DynamicDictionaries from "../../_core/dict/DynamicDictionaries";
declare class DictionaryLoader {
    #private;
    constructor(dic_path?: string);
    load(callback: (error: Error | null, dic: DynamicDictionaries) => void): void;
}
export default DictionaryLoader;
