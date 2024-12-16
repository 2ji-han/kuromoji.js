import DynamicDictionaries from "../dict/DynamicDictionaries";
declare class DictionaryLoader {
    #private;
    constructor(dic_path?: string);
    load: () => Promise<DynamicDictionaries>;
}
export default DictionaryLoader;
