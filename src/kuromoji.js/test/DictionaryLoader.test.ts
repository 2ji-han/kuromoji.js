import { beforeEach, describe, expect, it } from "bun:test";
import type DynamicDictionaries from "../../kuromoji-core/dict/DynamicDictionaries";
import DictionaryLoader from "../loader/DictionaryLoader";

const DIC_DIR = "dict/";

describe("DictionaryLoader", () => {
    let dictionaries: DynamicDictionaries | null = null; // target object

    beforeEach((done) => {
        const loader = new DictionaryLoader(DIC_DIR);
        loader.load((err, dic) => {
            dictionaries = dic;
            done();
        });
    });

    it("Unknown dictionaries are loaded properly", () => {
        if (!dictionaries) {
            throw new Error("dictionaries is null");
        }
        expect(dictionaries.unknown_dictionary.lookup(" ")).toEqual({
            class_id: 1,
            class_name: "SPACE",
            is_always_invoke: false,
            is_grouping: true,
            max_length: 0,
        });
    });
    it("TokenInfoDictionary is loaded properly", () => {
        if (!dictionaries) {
            throw new Error("dictionaries is null");
        }
        expect(dictionaries.token_info_dictionary.getFeatures(0)?.length).toBeGreaterThanOrEqual(1);
    });
});

describe("DictionaryLoader about loading", () => {
    it("could load directory path without suffix /", (done) => {
        const loader = new DictionaryLoader("dict"); // not have suffix /
        loader.load((err, dic) => {
            expect(err).toBeNull();
            expect(dic).not.toBeUndefined();
            done();
        });
    });
    it("couldn't load dictionary, then call with error", (done) => {
        const loader = new DictionaryLoader("non-exist/dictionaries");
        loader.load((err, dic) => {
            expect(err).toBeObject();
            expect(err).not.toBeNull();
            done();
        });
    });
});
