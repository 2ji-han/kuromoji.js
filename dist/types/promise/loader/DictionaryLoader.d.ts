import DynamicDictionaries from "../../_core/dict/DynamicDictionaries";
declare class DictionaryLoader {
    #private;
    constructor(dic_path?: string);
    load: () => Promise<DynamicDictionaries>;
}
export default DictionaryLoader;
